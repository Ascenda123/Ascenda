export const CALENDAR_FEED_CONFIG = [
  {
    id: 'google',
    label: 'Google Calendar',
    envKey: 'GOOGLE_CALENDAR_FEED_URL',
    docsUrl: 'https://support.google.com/calendar/answer/37100'
  },
  {
    id: 'outlook',
    label: 'Outlook Calendar',
    envKey: 'OUTLOOK_CALENDAR_FEED_URL',
    docsUrl: 'https://support.microsoft.com/en-us/office/export-or-save-calendar-events-as-an-ics-file-2f20e0d3-0c5e-4683-a1f7-9baf1d8fe4f6'
  },
  {
    id: 'ics',
    label: 'Custom ICS',
    envKey: 'CUSTOM_ICS_FEED_URL',
    docsUrl: 'https://www.cal.com/docs/api/ics'
  }
] as const;

export type CalendarFeedConfig = (typeof CALENDAR_FEED_CONFIG)[number];
export type CalendarFeedSourceId = CalendarFeedConfig['id'];

export interface CalendarFeedEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  sourceLabel: string;
  provider: CalendarFeedSourceId;
}

export interface CalendarFeedResponse {
  events: CalendarFeedEvent[];
  connectedSources: CalendarFeedSourceId[];
}
