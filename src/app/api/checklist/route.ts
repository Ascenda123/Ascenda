import { NextResponse, type NextRequest } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server';

const VALID_STATUSES = new Set(['todo', 'doing', 'done']);

export async function PATCH(request: NextRequest) {
  const supabase = createRouteHandlerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, status } = await request.json();

  if (!id || !status || !VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { data: checklistRow, error: checklistError } = await supabase
    .from('application_checklist')
    .select('id, application_id, status, applications!inner(profile_id)')
    .eq('id', id)
    .single();

  if (checklistError || !checklistRow) {
    return NextResponse.json({ error: 'Checklist item not found' }, { status: 404 });
  }

  if (checklistRow.applications?.profile_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error: updateError } = await supabase
    .from('application_checklist')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ item: data });
}
