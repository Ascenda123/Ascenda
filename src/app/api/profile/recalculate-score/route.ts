import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server';
import { buildStudentProfilePayload } from '@/lib/scoring/student_score_loader';
import { scoreStudentProfile } from '@/lib/scoring/student_scoring';

export async function POST() {
  const supabase = createRouteHandlerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await buildStudentProfilePayload(supabase, user.id);
    if (!payload) {
      return NextResponse.json({ error: 'Profile intake data is incomplete' }, { status: 400 });
    }

    const scoring = scoreStudentProfile(payload);
    const { error } = await supabase.from('student_scores').upsert({
      profile_id: user.id,
      total_score: scoring.total_score,
      student_band: scoring.student_band,
      eligibility_flags: scoring.eligibility_flags,
      readiness_flags: scoring.readiness_flags,
      breakdown: scoring.breakdown
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ score: scoring.total_score, band: scoring.student_band, breakdown: scoring.breakdown });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Scoring failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
