import { NextResponse, type NextRequest } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server';
import { defaultWeights } from '@/lib/matching/config';
import { loadMatchesForProfile } from '@/lib/matching/service';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Extract weights from query params
  const searchParams = request.nextUrl.searchParams;
  const parseWeight = (key: string, fallback: number) => {
    const raw = searchParams.get(key);
    const value = raw === null ? NaN : parseFloat(raw);
    if (!Number.isFinite(value) || value < 0) return fallback;
    return value;
  };

  const weights = {
    eligibility: parseWeight('w_eligibility', defaultWeights.eligibility),
    academicFit: parseWeight('w_academic', defaultWeights.academicFit),
    preferenceFit: parseWeight('w_preference', defaultWeights.preferenceFit),
    outcomes: parseWeight('w_outcomes', defaultWeights.outcomes)
  };
  const weightTotal = weights.eligibility + weights.academicFit + weights.preferenceFit + weights.outcomes;
  const safeWeights = weightTotal > 0 ? weights : defaultWeights;

  const matchResult = await loadMatchesForProfile(supabase, user.id, {
    resultLimit: 20,
    weights: safeWeights
  });

  if (matchResult.missingSections.length > 0) {
    return NextResponse.json({ matches: [], missingSections: matchResult.missingSections });
  }

  const matches = matchResult.matches.map((match) => ({
    program_id: match.program.id,
    university_id: match.university.id,
    score: match.score,
    breakdown: match.breakdown,
    blockingReasons: match.blockingReasons,
    tier: match.tier
  }));

  return NextResponse.json({ matches });
}
