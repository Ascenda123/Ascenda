import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server';

const MIN_QUERY_LENGTH = 2;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q')?.trim() ?? '';
  const trending = url.searchParams.get('trending') === 'true';

  const supabase = createRouteHandlerSupabaseClient();

  if (!trending && query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ programs: [], universities: [] }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }

  const programSelect = 'id,course_name,study_level,universities!inner(name,country,city,region)';
  const universitySelect = 'id,name,country,city,region';

  let programQuery = supabase.from('programs').select(programSelect).limit(trending ? 4 : 5);
  let universityQuery = supabase.from('universities').select(universitySelect).limit(trending ? 4 : 5);

  if (trending) {
    programQuery = programQuery.order('course_name', { ascending: true });
    universityQuery = universityQuery.order('name', { ascending: true });
  } else {
    const pattern = `%${query}%`;
    programQuery = programQuery.ilike('course_name', pattern);
    universityQuery = universityQuery.ilike('name', pattern);
  }

  const [programsRes, universitiesRes] = await Promise.all([programQuery, universityQuery]);

  if (programsRes.error || universitiesRes.error) {
    const error = programsRes.error ?? universitiesRes.error;
    return NextResponse.json({ error: error?.message ?? 'Search failed' }, { status: 500 });
  }

  return NextResponse.json(
    {
      programs: programsRes.data ?? [],
      universities: universitiesRes.data ?? []
    },
    { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=120' } }
  );
}
