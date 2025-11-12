import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server';
import { rankMatches, type MatchInput } from '@/lib/matching/engine';

export async function GET() {
  const supabase = createRouteHandlerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [{ data: academics }, { data: preferences }, { data: aspirations }] = await Promise.all([
    supabase.from('student_academics').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_preferences').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_aspirations').select('*').eq('profile_id', user.id).single()
  ]);

  if (!academics || !preferences || !aspirations) {
    return NextResponse.json({ matches: [] });
  }

  const [{ data: programs }, { data: universities }, { data: requirements }] = await Promise.all([
    supabase.from('programs').select('*'),
    supabase.from('universities').select('*'),
    supabase.from('program_requirements').select('*')
  ]);

  if (!programs || !universities) {
    return NextResponse.json({ matches: [] });
  }

  const requirementMap = new Map(requirements?.map((item) => [item.program_id, item]));
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
      } satisfies MatchInput;
    })
    .filter((value): value is MatchInput => value !== null);

  const results = rankMatches(inputs).slice(0, 20);
  return NextResponse.json({ matches: results });
}
