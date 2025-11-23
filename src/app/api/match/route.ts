import { NextResponse, type NextRequest } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server';
import { rankMatches, type MatchInput, type Program, type University, type ProgramRequirement, type StudentAcademics, type StudentPreferences, type StudentAspirations } from '@/lib/matching/engine';
import { defaultWeights } from '@/lib/matching/config';

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
  const weights = {
    eligibility: parseFloat(searchParams.get('w_eligibility') || String(defaultWeights.eligibility)),
    academicFit: parseFloat(searchParams.get('w_academic') || String(defaultWeights.academicFit)),
    preferenceFit: parseFloat(searchParams.get('w_preference') || String(defaultWeights.preferenceFit)),
    outcomes: parseFloat(searchParams.get('w_outcomes') || String(defaultWeights.outcomes))
  };

  const [{ data: academicsData }, { data: preferencesData }, { data: aspirationsData }] = await Promise.all([
    supabase.from('student_academics').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_preferences').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_aspirations').select('*').eq('profile_id', user.id).single()
  ]);

  if (!academicsData || !preferencesData || !aspirationsData) {
    return NextResponse.json({ matches: [] });
  }

  // Transform snake_case DB data to camelCase types
  const academics: StudentAcademics = {
    curriculum: academicsData.curriculum,
    gpa: academicsData.gpa,
    ibTotal: academicsData.ib_total,
    sat: academicsData.sat,
    act: academicsData.act,
    toefl: academicsData.toefl,
    ielts: academicsData.ielts,
    subjectGrades: academicsData.subject_grades
  };

  const preferences: StudentPreferences = {
    budgetMin: preferencesData.budget_min,
    budgetMax: preferencesData.budget_max,
    aidNeeded: preferencesData.aid_needed,
    countries: preferencesData.countries,
    languages: preferencesData.languages,
    campusType: preferencesData.campus_type,
    setting: preferencesData.setting,
    size: preferencesData.size,
    programLevels: preferencesData.program_levels,
    delivery: preferencesData.delivery
  };

  const aspirations: StudentAspirations = {
    targetFields: aspirationsData.target_fields,
    jobTitles: aspirationsData.job_titles
  };

  const [{ data: programsData }, { data: universitiesData }, { data: requirementsData }] = await Promise.all([
    supabase.from('programs').select('*'),
    supabase.from('universities').select('*'),
    supabase.from('program_requirements').select('*')
  ]);

  if (!programsData || !universitiesData) {
    return NextResponse.json({ matches: [] });
  }

  const requirements = (requirementsData || []).map((r: any): ProgramRequirement => ({
    programId: r.program_id,
    curriculum: r.curriculum,
    minGpa: r.min_gpa,
    minIbTotal: r.min_ib_total,
    minSat: r.min_sat,
    minAct: r.min_act,
    requiredSubjects: r.required_subjects,
    languageTests: r.language_tests,
    otherRequirements: r.other_requirements
  }));

  const requirementMap = new Map(requirements.map((item: ProgramRequirement) => [item.programId, item]));

  const universityMap = new Map(universitiesData.map((u: any): [string, University] => [u.id, {
    id: u.id,
    name: u.name,
    country: u.country,
    region: u.region,
    rankOverall: u.rank_overall,
    rankSource: u.rank_source,
    acceptanceRate: u.acceptance_rate,
    requiresTest: u.requires_test
  }]));

  const inputs: MatchInput[] = programsData
    .map((p: any) => {
      const university = universityMap.get(p.university_id);
      if (!university) return null;

      const program: Program = {
        id: p.id,
        name: p.name,
        field: p.field,
        level: p.level,
        durationYears: p.duration_years,
        language: p.language,
        mode: p.mode,
        intakeMonths: p.intake_months,
        tuition: p.tuition,
        currency: p.currency,
        url: p.url,
        universityId: p.university_id
      };

      return {
        academics,
        preferences,
        aspirations,
        program,
        university,
        requirement: requirementMap.get(program.id) ?? undefined,
        weights
      } as MatchInput;
    })
    .filter((value: MatchInput | null): value is MatchInput => value !== null);

  const results = rankMatches(inputs, weights).slice(0, 20);
  return NextResponse.json({ matches: results });
}
