// Thin typed wrappers around the help_requests and notifications tables.
// The generated Database type in src/lib/types/database.ts predates the
// 20260512120000 migration; until it's regenerated, we cast through `any`
// in one place rather than scattering casts across feature code.

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  HelpMeeting,
  HelpMeetingInsert,
  HelpMessage,
  HelpMessageInsert,
  HelpNote,
  HelpNoteInsert,
  HelpRequest,
  HelpRequestInsert,
  HelpRequestStatus,
  Notification,
  NotificationAudience,
  NotificationInsert
} from '@/lib/types/demo-tables';

type AnyClient = SupabaseClient<any, any, any>;

const tbl = (supabase: AnyClient, name: string) => (supabase as any).from(name);

export const insertHelpRequest = async (supabase: AnyClient, row: HelpRequestInsert) => {
  const { data, error } = await tbl(supabase, 'help_requests').insert(row).select('id').single();
  if (error) throw error;
  return data as { id: string };
};

export const insertNotification = async (supabase: AnyClient, row: NotificationInsert) => {
  const { error } = await tbl(supabase, 'notifications').insert(row);
  if (error) throw error;
};

export const listOpenHelpRequests = async (supabase: AnyClient): Promise<HelpRequest[]> => {
  const { data, error } = await tbl(supabase, 'help_requests')
    .select('*')
    .in('status', ['open', 'accepted'])
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as HelpRequest[];
};

export const updateHelpRequestStatus = async (
  supabase: AnyClient,
  id: string,
  status: HelpRequestStatus
) => {
  const patch: Record<string, unknown> = { status };
  if (status === 'accepted') patch.accepted_at = new Date().toISOString();
  if (status === 'resolved') patch.resolved_at = new Date().toISOString();
  const { error } = await tbl(supabase, 'help_requests').update(patch).eq('id', id);
  if (error) throw error;
};

export const listNotifications = async (
  supabase: AnyClient,
  profileId: string,
  audience: NotificationAudience,
  limit = 20
): Promise<Notification[]> => {
  const { data, error } = await tbl(supabase, 'notifications')
    .select('*')
    .eq('profile_id', profileId)
    .eq('audience', audience)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Notification[];
};

export const markNotificationRead = async (supabase: AnyClient, id: string) => {
  const { error } = await tbl(supabase, 'notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
};

export const markAllNotificationsRead = async (
  supabase: AnyClient,
  profileId: string,
  audience: NotificationAudience
) => {
  const { error } = await tbl(supabase, 'notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('profile_id', profileId)
    .eq('audience', audience)
    .is('read_at', null);
  if (error) throw error;
};

export const getHelpRequest = async (
  supabase: AnyClient,
  id: string
): Promise<HelpRequest | null> => {
  const { data, error } = await tbl(supabase, 'help_requests').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as HelpRequest | null;
};

export const listHelpMessages = async (
  supabase: AnyClient,
  requestId: string
): Promise<HelpMessage[]> => {
  const { data, error } = await tbl(supabase, 'help_messages')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as HelpMessage[];
};

export const insertHelpMessage = async (supabase: AnyClient, row: HelpMessageInsert) => {
  const { data, error } = await tbl(supabase, 'help_messages').insert(row).select('*').single();
  if (error) throw error;
  return data as HelpMessage;
};

export const listHelpNotes = async (
  supabase: AnyClient,
  requestId: string
): Promise<HelpNote[]> => {
  const { data, error } = await tbl(supabase, 'help_notes')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as HelpNote[];
};

export const insertHelpNote = async (supabase: AnyClient, row: HelpNoteInsert) => {
  const { data, error } = await tbl(supabase, 'help_notes').insert(row).select('*').single();
  if (error) throw error;
  return data as HelpNote;
};

export const listHelpMeetings = async (
  supabase: AnyClient,
  requestId: string
): Promise<HelpMeeting[]> => {
  const { data, error } = await tbl(supabase, 'help_meetings')
    .select('*')
    .eq('request_id', requestId)
    .order('scheduled_for', { ascending: true });
  if (error) throw error;
  return (data ?? []) as HelpMeeting[];
};

export const insertHelpMeeting = async (supabase: AnyClient, row: HelpMeetingInsert) => {
  const { data, error } = await tbl(supabase, 'help_meetings').insert(row).select('*').single();
  if (error) throw error;
  return data as HelpMeeting;
};
