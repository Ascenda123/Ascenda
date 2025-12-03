import { NextResponse, type NextRequest } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server';
import {
  rankMatches,
  type MatchInput,
  type Program,
  type University,
  type ProgramRequirement,
  type StudentAcademics,
  type StudentPreferences,
  type StudentAspirations
} from '@/lib/matching/engine';
import { defaultWeights } from '@/lib/matching/config';
import {
  buildMatchInput,
  mapAcademicsRow,
  mapAspirationsRow,
  mapPreferencesRow,
  mapProgramRow,
  mapRequirementRow,
  mapUniversityRow
} from '@/lib/matching/transform';

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

  const [
    { data: academicsData, error: academicsError },
    { data: preferencesData, error: preferencesError },
    { data: aspirationsData, error: aspirationsError }
  ] = await Promise.all([
    supabase.from('student_academics').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_preferences').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_aspirations').select('*').eq('profile_id', user.id).single()
  ]);

  if (academicsError || preferencesError || aspirationsError) {
    const message = academicsError?.message ?? preferencesError?.message ?? aspirationsError?.message ?? 'Failed to load profile data';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (!academicsData || !preferencesData || !aspirationsData) {
    return NextResponse.json({ matches: [] });
  }

  // Transform snake_case DB data to camelCase types
  const academics: StudentAcademics = mapAcademicsRow(academicsData);
  const preferences: StudentPreferences = mapPreferencesRow(preferencesData);
  const aspirations: StudentAspirations = mapAspirationsRow(aspirationsData);

  const [
    { data: programsData, error: programsError },
    { data: universitiesData, error: universitiesError },
    { data: requirementsData, error: requirementsError }
  ] = await Promise.all([
    supabase
      .from('programs')
      .select(
        'id,course_name,study_level,duration,start_date,campus,tuition_fees_international,tuition_fees_home,provider_course_url,university_id'
      ),
    supabase
      .from('universities')
      .select('id,name,country,region,rank_overall,rank_source,acceptance_rate,requires_test'),
    supabase
      .from('program_requirements')
      .select(
        'program_id,curriculum,min_gpa,min_ib_total,min_sat,min_act,required_subjects,language_tests,other_requirements'
      )
  ]);

  if (programsError || universitiesError || requirementsError) {
    const message = programsError?.message ?? universitiesError?.message ?? requirementsError?.message ?? 'Failed to load catalog data';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (!programsData || !universitiesData) {
    return NextResponse.json({ matches: [] });
  }

  const requirements = (requirementsData || []).map(mapRequirementRow);

  const requirementMap = new Map<string, any>(requirements.map((item: ProgramRequirement) => [item.programId, item]));

  const universityMap = new Map<string, any>(universitiesData.map((u: any): [string, University] => [u.id, mapUniversityRow(u)]));

  const inputs: MatchInput[] = programsData
    .map((p: any) => {
      const program = mapProgramRow(p);
      const university = universityMap.get(program.universityId);
      return buildMatchInput({
        academics,
        preferences,
        aspirations,
        program,
        university,
        requirement: requirementMap.get(program.id)
      });
    })
    .filter((value: MatchInput | null): value is MatchInput => value !== null)
    .map((input: MatchInput) => ({
      ...input,
      weights: safeWeights
    }));

  const results = rankMatches(inputs, safeWeights).slice(0, 20);
  return NextResponse.json({ matches: results });
}
