import { NextResponse } from 'next/server';

import { CALENDAR_FEED_CONFIG, type CalendarFeedEvent, type CalendarFeedResponse } from '@/lib/calendar-feed';

const unfoldIcs = (ics: string) => ics.replace(/\r?\n[ \t]/g, '\n');

const toIsoDate = (candidate: string) => {
  const trimmed = candidate.trim();
  const dateTimeZ = trimmed.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  const dateTimeNoZ = trimmed.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/);
  const dateOnly = trimmed.match(/^(\d{4})(\d{2})(\d{2})$/);

  if (dateTimeZ) {
    return `${dateTimeZ[1]}-${dateTimeZ[2]}-${dateTimeZ[3]}T${dateTimeZ[4]}:${dateTimeZ[5]}:${dateTimeZ[6]}Z`;
  }

  if (dateTimeNoZ) {
    return `${dateTimeNoZ[1]}-${dateTimeNoZ[2]}-${dateTimeNoZ[3]}T${dateTimeNoZ[4]}:${dateTimeNoZ[5]}:${dateTimeNoZ[6]}Z`;
  }

  if (dateOnly) {
    return `${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}T00:00:00Z`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return new Date().toISOString();
};

const parseIcsEvents = (data: string, source: (typeof CALENDAR_FEED_CONFIG)[number]) => {
  const unfolded = unfoldIcs(data);
  const blocks = unfolded.split('BEGIN:VEVENT').slice(1);

  return blocks
    .map((block, index) => {
      const lines = block.split(/\r?\n/);
      const event: Partial<CalendarFeedEvent> = {
        sourceLabel: source.label,
        provider: source.id
      };

      for (const line of lines) {
        if (!line || line.startsWith('END:VEVENT')) continue;

        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) continue;

        const key = line.substring(0, colonIndex);
        const value = line.substring(colonIndex + 1);

        if (key.startsWith('UID')) {
          event.id = value;
        } else if (key.startsWith('SUMMARY')) {
          event.title = value.replace(/\\n/g, ' ').trim();
        } else if (key.startsWith('DTSTART')) {
          event.start = toIsoDate(value);
        } else if (key.startsWith('DTEND')) {
          event.end = toIsoDate(value);
        } else if (key.startsWith('DESCRIPTION')) {
          event.description = value.replace(/\\n/g, ' ').trim();
        } else if (key.startsWith('LOCATION')) {
          event.location = value.replace(/\\n/g, ' ').trim();
        }
      }

      if (!event.id) {
        event.id = `${source.id}-${index}-${Math.random().toString(36).slice(2, 8)}`;
      }

      if (!event.start) {
        return null;
      }

      if (!event.end) {
        event.end = event.start;
      }

      return event as CalendarFeedEvent;
    })
    .filter((event): event is CalendarFeedEvent => Boolean(event));
};

export async function GET() {
  const aggregatedEvents: CalendarFeedEvent[] = [];
  const connectedSources: Set<(typeof CALENDAR_FEED_CONFIG)[number]['id']> = new Set();

  for (const source of CALENDAR_FEED_CONFIG) {
    const url = process.env[source.envKey];
    if (!url) {
      continue;
    }

    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        continue;
      }

      const text = await response.text();
      const events = parseIcsEvents(text, source);
      aggregatedEvents.push(...events);
      connectedSources.add(source.id);
    } catch {
      // Failures should not block the other feeds.
    }
  }

  const sortedEvents = aggregatedEvents.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  const body: CalendarFeedResponse = {
    events: sortedEvents.slice(0, 50),
    connectedSources: Array.from(connectedSources)
  };

  return NextResponse.json(body, { status: 200 });
}
