'use client';

import { Button } from '@/components/ui/button';
import { Calendar, dateFnsLocalizer, Event as CalendarEvent } from 'react-big-calendar';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

export interface PlannerEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  category: 'deadline' | 'reference' | 'interview' | 'task';
  detail?: string;
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
  task: { background: '#fef9c3', color: '#a16207' }
};

const mapToCalendarEvent = (event: PlannerEvent): CalendarEvent => {
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
  const calendarEvents = events.map(mapToCalendarEvent);

  return (
    <div className="space-y-4 rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Calendar view</h2>
          <p className="text-sm text-slate-500">
            Full calendar that mirrors a modern planner—the week is focused, the days stay clickable.
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Sync ready
        </div>
      </header>
      <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-slate-50">
        <Calendar
          className="bg-white text-slate-900"
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          views={['week', 'day']}
          defaultView="week"
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: (toolbarProps) => (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-[28px] border-b border-slate-100 bg-white p-4 text-sm font-semibold text-slate-800">
                <div>
                  <p>{toolbarProps.label}</p>
                  <p className="text-xs font-normal uppercase tracking-[0.4em] text-slate-400">Week plan</p>
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
          style={{ minHeight: 380 }}
        />
      </div>
    </div>
  );
};
