import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server';
import { rankMatches, type MatchInput, type Program, type University, type ProgramRequirement } from '@/lib/matching/engine';

export async function GET() {
  const supabase = createRouteHandlerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [{ data: academicsData }, { data: preferencesData }, { data: aspirationsData }] = await Promise.all([
    supabase.from('student_academics').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_preferences').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_aspirations').select('*').eq('profile_id', user.id).single()
  ]);

  const academics = academicsData as unknown as MatchInput['academics'];
  const preferences = preferencesData as unknown as MatchInput['preferences'];
  const aspirations = aspirationsData as unknown as MatchInput['aspirations'];

  if (!academics || !preferences || !aspirations) {
    return NextResponse.json({ matches: [] });
  }

  const [{ data: programsData }, { data: universitiesData }, { data: requirementsData }] = await Promise.all([
    supabase.from('programs').select('*'),
    supabase.from('universities').select('*'),
    supabase.from('program_requirements').select('*')
  ]);

  const programs = programsData as unknown as Program[];
  const universities = universitiesData as unknown as University[];
  const requirements = requirementsData as unknown as ProgramRequirement[];

  if (!programs || !universities) {
    return NextResponse.json({ matches: [] });
  }

  const requirementMap = new Map(requirements?.map((item) => [item.program_id, item]) ?? []);
  const universityMap = new Map(universities.map((item) => [item.id, item]));

  const inputs: MatchInput[] = programs
    .map((program) => {
      const university = universityMap.get(program.university_id);
      if (!university) return null;
      return {
        academics,
        preferences,
        aspirations,
        program,
        university,
        requirement: requirementMap.get(program.id) ?? undefined
      } as MatchInput;
    })
    .filter((value): value is MatchInput => value !== null);

  const results = rankMatches(inputs).slice(0, 20);
  return NextResponse.json({ matches: results });
}
