import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server';

const MIN_QUERY_LENGTH = 2;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q')?.trim() ?? '';
  const trending = url.searchParams.get('trending') === 'true';
  const limit = trending ? 6 : 6;

  const supabase = createRouteHandlerSupabaseClient();

  if (!trending && query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ programs: [], universities: [] }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }

  const programSelect = 'id,course_name,name,study_level,universities!inner(name,country,city,region)';
  const universitySelect = 'id,name,country,city,region';

  let programQuery = supabase.from('programs').select(programSelect).limit(limit);
  let universityQuery = supabase.from('universities').select(universitySelect).limit(limit);

  if (trending) {
    programQuery = programQuery.order('course_name', { ascending: true });
    universityQuery = universityQuery.order('name', { ascending: true });
  } else {
    // Split into words so "oxford university" matches "University of Oxford".
    // Each word must appear somewhere in the name (AND logic via chained ilike).
    const words = query.split(/\s+/).filter((w) => w.length >= 2);
    const pattern = `%${query}%`;
    programQuery = programQuery.or(`course_name.ilike.${pattern},name.ilike.${pattern}`);
    if (words.length > 1) {
      words.forEach((word) => {
        universityQuery = universityQuery.ilike('name', `%${word}%`);
      });
    } else {
      universityQuery = universityQuery.ilike('name', pattern);
    }
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
    {
      // Accuracy over caching: always pull fresh rows from Supabase
      headers: { 'Cache-Control': 'no-store' }
    }
  );
}
