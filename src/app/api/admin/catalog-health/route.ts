import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server';

const unauthorized = () =>
  NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

// Lightweight health check to verify catalog data is present and key fields are usable.
export async function GET(request: Request) {
  // Simple bearer guard. Set ADMIN_API_KEY to require access; if unset, allow for local use.
  const adminKey = process.env.ADMIN_API_KEY;
  if (adminKey) {
    const header = request.headers.get('authorization');
    const token = header?.replace(/^Bearer\s+/i, '');
    if (!token || token !== adminKey) return unauthorized();
  }

  const supabase = createRouteHandlerSupabaseClient();

  const [{ count: universityCount, error: uniErr }, { count: programCount, error: progErr }] =
    await Promise.all([
      supabase.from('universities').select('*', { count: 'exact', head: true }),
      supabase.from('programs').select('*', { count: 'exact', head: true })
    ]);

  if (uniErr || progErr) {
    const err = uniErr ?? progErr;
    return NextResponse.json({ ok: false, error: err?.message ?? 'Count failed' }, { status: 500 });
  }

  // Pull a couple of sample programs with the new UCAS fields to confirm availability.
  const sample = await supabase
    .from('programs')
    .select(
      'id, course_name, study_level, campus, start_date, ucas_code, course_summary, modules, assessment_methods, provider_course_url, provider_apply_url'
    )
    .limit(3);

  if (sample.error) {
    return NextResponse.json({ ok: false, error: sample.error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    counts: {
      universities: universityCount ?? 0,
      programs: programCount ?? 0
    },
    samplePrograms: sample.data ?? []
  });
}
