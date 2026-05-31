// Hand-typed shapes for tables added in 20260512120000_help_requests_and_notifications.sql.
// Kept separate from the generated database.ts; if/when the schema dump is regenerated,
// these can be folded back into the main Database type.

export type HelpRequestStatus = 'open' | 'accepted' | 'resolved';
export type HelpRequestInitiator = 'student' | 'counsellor';

export interface HelpRequest {
  id: string;
  student_profile_id: string;
  application_id: string | null;
  university: string | null;
  program: string | null;
  subject: string;
  body: string;
  status: HelpRequestStatus;
  initiated_by: HelpRequestInitiator;
  created_at: string;
  accepted_at: string | null;
  resolved_at: string | null;
}

export type HelpRequestInsert = Pick<
  HelpRequest,
  'student_profile_id' | 'subject' | 'body'
> &
  Partial<Pick<HelpRequest, 'application_id' | 'university' | 'program' | 'status' | 'initiated_by'>>;

export type NotificationAudience = 'student' | 'counsellor';

export interface Notification {
  id: string;
  profile_id: string;
  audience: NotificationAudience;
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
  Partial<Pick<Notification, 'audience' | 'body' | 'href'>>;

export type HelpMessageAuthorRole = 'student' | 'counsellor';

export interface HelpMessage {
  id: string;
  request_id: string;
  author_profile_id: string;
  author_role: HelpMessageAuthorRole;
  body: string;
  created_at: string;
}

export type HelpMessageInsert = Pick<HelpMessage, 'request_id' | 'author_profile_id' | 'author_role' | 'body'>;

export interface HelpNote {
  id: string;
  request_id: string;
  author_profile_id: string;
  body: string;
  created_at: string;
}

export type HelpNoteInsert = Pick<HelpNote, 'request_id' | 'author_profile_id' | 'body'>;

export type HelpMeetingStatus = 'proposed' | 'confirmed' | 'cancelled' | 'completed';

export interface HelpMeeting {
  id: string;
  request_id: string;
  counsellor_profile_id: string;
  student_profile_id: string;
  title: string;
  scheduled_for: string;
  duration_minutes: number;
  location: string | null;
  status: HelpMeetingStatus;
  created_at: string;
}

export type HelpMeetingInsert = Pick<
  HelpMeeting,
  'request_id' | 'counsellor_profile_id' | 'student_profile_id' | 'title' | 'scheduled_for'
> &
  Partial<Pick<HelpMeeting, 'duration_minutes' | 'location' | 'status'>>;
