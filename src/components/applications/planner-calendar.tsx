'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Calendar, dateFnsLocalizer, Event as CalendarEvent, type View, type ToolbarProps } from 'react-big-calendar';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CALENDAR_FEED_CONFIG, type CalendarFeedResponse } from '@/lib/calendar-feed';

export interface PlannerEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  category: 'deadline' | 'reference' | 'interview' | 'task' | 'external';
  detail?: string;
  source?: string;
}

interface MyCalendarEvent extends CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: PlannerEvent;
}

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

const CATEGORY_STYLES: Record<PlannerEvent['category'], { background: string; color: string }> = {
  deadline: { background: '#fee2e2', color: '#b91c1c' },
  reference: { background: '#dbeafe', color: '#1d4ed8' },
  interview: { background: '#dcfce7', color: '#047857' },
  task: { background: '#fef9c3', color: '#a16207' },
  external: { background: '#eef2ff', color: '#4338ca' }
};

const VIEW_OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' }
] as const;

type CalendarView = (typeof VIEW_OPTIONS)[number]['value'];

const fetchCalendarFeed = async (): Promise<CalendarFeedResponse> => {
  const response = await fetch('/api/calendar-feed');
  if (!response.ok) {
    throw new Error('Failed to load calendar feeds');
  }

  return response.json();
};

const mapToCalendarEvent = (event: PlannerEvent): MyCalendarEvent => {
  const start = new Date(event.date);
  const end = event.endDate ? new Date(event.endDate) : new Date(start);
  end.setDate(end.getDate() + 1);
  return {
    id: event.id,
    title: event.title,
    start,
    end,
    allDay: true,
    resource: event
  };
};

const eventStyleGetter = (event: CalendarEvent) => {
  const plannerEvent = event.resource as PlannerEvent;
  const { background, color } = CATEGORY_STYLES[plannerEvent.category];
  return {
    style: {
      background,
      color,
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: '14px',
      padding: '0.35rem 0.65rem'
    }
  };
};

export const PlannerCalendar = ({ events }: { events: PlannerEvent[] }) => {
  const [selectedView, setSelectedView] = useState<CalendarView>('month');
  const [showSyncOptions, setShowSyncOptions] = useState(false);
  const { data: feedData, isFetching: isFeedLoading } = useQuery({
    queryKey: ['calendar-feed'],
    queryFn: fetchCalendarFeed,
    staleTime: 1000 * 60 * 5
  });

  const externalPlannerEvents = useMemo(() => {
    const feedEvents = feedData?.events ?? [];
    return feedEvents.map((event) => ({
      id: `external-${event.provider}-${event.id}`,
      title: event.title,
      date: event.start,
      endDate: event.end,
      category: 'external' as const,
      detail: event.description ?? event.location,
      source: event.sourceLabel
    }));
  }, [feedData?.events]);

  const combinedEvents = useMemo(() => [...events, ...externalPlannerEvents], [events, externalPlannerEvents]);
  const calendarEvents = useMemo(() => combinedEvents.map(mapToCalendarEvent), [combinedEvents]);
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return calendarEvents
      .filter((event) => event.end > now)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 4);
  }, [calendarEvents]);
  const connectedSources = feedData?.connectedSources ?? [];

  return (
    <div className="space-y-6 rounded-[36px] border border-border bg-card p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Calendar view</h2>
          <p className="text-sm text-muted-foreground">
            Seamless planner view with week, month, and day filters plus quick access to upcoming events.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {VIEW_OPTIONS.map((option) => (
            <Button
              key={option.value}
              size="xs"
              variant={selectedView === option.value ? 'secondary' : 'ghost'}
              onClick={() => setSelectedView(option.value)}
              className="uppercase tracking-[0.4em]"
            >
              {option.label}
            </Button>
          ))}
          <div className="rounded-full bg-muted px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            sync ready
          </div>
        </div>
      </header>
      <div className="grid gap-6 lg:grid-cols-[3fr,1fr]">
        <div className="overflow-hidden rounded-[32px] border border-border bg-card shadow-[0_25px_60px_rgba(15,23,42,0.06)]">
          <Calendar<MyCalendarEvent>
            className="bg-card text-foreground"
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            views={['day', 'week', 'month']}
            view={selectedView}
            onView={(view: View) => setSelectedView(view as CalendarView)}
            eventPropGetter={eventStyleGetter}
            components={{
              toolbar: (toolbarProps: ToolbarProps<MyCalendarEvent>) => (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-[28px] border-b border-border bg-card p-4 text-sm font-semibold text-foreground">
                  <div>
                    <p>{toolbarProps.label}</p>
                    <p className="text-xs font-normal uppercase tracking-[0.4em] text-muted-foreground">Plan view</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="xs" variant="ghost" onClick={() => toolbarProps.onNavigate('PREV')}>
                      Prev
                    </Button>
                    <Button size="xs" variant="ghost" onClick={() => toolbarProps.onNavigate('TODAY')}>
                      Today
                    </Button>
                    <Button size="xs" variant="ghost" onClick={() => toolbarProps.onNavigate('NEXT')}>
                      Next
                    </Button>
                  </div>
                </div>
              )
            }}
            style={{ minHeight: selectedView === 'month' ? 420 : 340 }}
          />
        </div>
        <aside className="space-y-4 rounded-[32px] border border-border bg-card p-5 shadow-[0_22px_55px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Upcoming events</p>
              <span className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
                {isFeedLoading ? 'Syncing' : 'Live'}
              </span>
            </div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
              {connectedSources.length > 0
                ? `${connectedSources.length} feed${connectedSources.length > 1 ? 's' : ''} connected`
                : 'No external feeds configured yet'}
            </p>
          </div>
          <ul className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => {
                const plannerEvent = event.resource as PlannerEvent;
                return (
                  <li
                    key={event.id}
                    className="rounded-2xl border border-border bg-card p-3 text-sm text-foreground shadow-[0_12px_35px_rgba(15,23,42,0.08)]"
                  >
                    <p className="font-semibold text-foreground">{plannerEvent.title}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      {plannerEvent.source ?? plannerEvent.category} • {format(event.start, 'MMM d')}
                    </p>
                    {plannerEvent.detail && <p className="text-xs text-muted-foreground">{plannerEvent.detail}</p>}
                  </li>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground">No upcoming events. Schedule something and sync your calendars to see it here.</p>
            )}
          </ul>
          <Button size="sm" variant="outline" className="w-full" onClick={() => setShowSyncOptions((prev) => !prev)}>
            {showSyncOptions ? 'Hide calendar sync options' : 'Connect more calendars'}
          </Button>
          {showSyncOptions && (
            <div className="space-y-3 rounded-2xl border border-border bg-muted/50 p-4 text-[13px] text-muted-foreground">
              {CALENDAR_FEED_CONFIG.map((source) => {
                const isConnected = connectedSources.includes(source.id);
                return (
                  <div key={source.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{source.label}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {isConnected
                          ? `Synced via ${source.envKey}`
                          : `Export ICS → set ${source.envKey}`}
                      </p>
                    </div>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="whitespace-nowrap"
                      onClick={() => window.open(source.docsUrl, '_blank')}
                    >
                      {isConnected ? 'Refresh feed' : 'Get instructions'}
                    </Button>
                  </div>
                );
              })}
              <p className="text-[11px] text-muted-foreground">
                After adding the feed URL, restart your deployment and refresh this page to pull the new events.
              </p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Supports Google, Outlook, and any ICS feed—events merge with planner deadlines for a unified view.
          </p>
        </aside>
      </div>
    </div>
  );
};
