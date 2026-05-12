// Hand-typed shapes for tables added in 20260512120000_help_requests_and_notifications.sql.
// Kept separate from the generated database.ts; if/when the schema dump is regenerated,
// these can be folded back into the main Database type.

export type HelpRequestStatus = 'open' | 'accepted' | 'resolved';

export interface HelpRequest {
  id: string;
  student_profile_id: string;
  application_id: string | null;
  university: string | null;
  program: string | null;
  subject: string;
  body: string;
  status: HelpRequestStatus;
  created_at: string;
  accepted_at: string | null;
  resolved_at: string | null;
}

export type HelpRequestInsert = Pick<
  HelpRequest,
  'student_profile_id' | 'subject' | 'body'
> &
  Partial<Pick<HelpRequest, 'application_id' | 'university' | 'program' | 'status'>>;

export interface Notification {
  id: string;
  profile_id: string;
  kind: string;
  title: string;
  body: string | null;
  href: string | null;
  read_at: string | null;
  created_at: string;
}

export type NotificationInsert = Pick<
  Notification,
  'profile_id' | 'kind' | 'title'
> &
  Partial<Pick<Notification, 'body' | 'href'>>;
