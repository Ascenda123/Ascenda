import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server';

const MIN_QUERY_LENGTH = 2;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q')?.trim() ?? '';
  const trending = url.searchParams.get('trending') === 'true';
  const limit = 6;

  const supabase = createRouteHandlerSupabaseClient();

  if (!trending && query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ programs: [], universities: [] }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }

  const programSelect = 'id,course_name,name,study_level,universities!inner(name,country,city,region)';
  const universitySelect = 'id,name,country,city,region';

  if (trending) {
    const [programsRes, universitiesRes] = await Promise.all([
      supabase.from('programs').select(programSelect).order('course_name', { ascending: true }).limit(limit),
      supabase.from('universities').select(universitySelect).order('name', { ascending: true }).limit(limit)
    ]);
    return NextResponse.json(
      { programs: programsRes.data ?? [], universities: universitiesRes.data ?? [] },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }

  // Split query into meaningful words (≥2 chars) for word-order-independent matching.
  // e.g. "oxford university" → ["oxford", "university"] matches "University of Oxford"
  const words = query.split(/\s+/).filter((w) => w.length >= 2);
  const fullPattern = `%${query}%`;

  // 1. Find universities where ALL words appear in the name (in any order).
  let universityQuery = supabase.from('universities').select(universitySelect).limit(limit);
  if (words.length > 1) {
    words.forEach((word) => { universityQuery = universityQuery.ilike('name', `%${word}%`); });
  } else {
    universityQuery = universityQuery.ilike('name', fullPattern);
  }

  // 2. Find university IDs matching all words — used to surface programs from those universities.
  let matchedUniIds: string[] = [];
  if (words.length > 1) {
    let uniIdQuery = supabase.from('universities').select('id').limit(20);
    words.forEach((word) => { uniIdQuery = uniIdQuery.ilike('name', `%${word}%`); });
    const { data: uniIdData } = await uniIdQuery;
    matchedUniIds = (uniIdData ?? []).map((u) => u.id);
  }

  // 3. Program query: match course_name on each word AND/OR be from a matched university.
  //    Priority: programs whose course_name matches the query OR programs at matched universities.
  let programQuery = supabase.from('programs').select(programSelect).limit(limit);
  if (matchedUniIds.length > 0) {
    // Words matched a university — find programs at that university or matching any word in course_name
    const wordOrParts = words.map((w) => `course_name.ilike.%${w}%`).join(',');
    programQuery = programQuery.or(`${wordOrParts},university_id.in.(${matchedUniIds.join(',')})`);
  } else if (words.length > 1) {
    // No university matched — search course_name for each word (AND)
    words.forEach((word) => { programQuery = programQuery.ilike('course_name', `%${word}%`); });
  } else {
    programQuery = programQuery.or(`course_name.ilike.${fullPattern},name.ilike.${fullPattern}`);
  }

  const [programsRes, universitiesRes] = await Promise.all([programQuery, universityQuery]);

  if (programsRes.error || universitiesRes.error) {
    const error = programsRes.error ?? universitiesRes.error;
    return NextResponse.json({ error: error?.message ?? 'Search failed' }, { status: 500 });
  }

  return NextResponse.json(
    { programs: programsRes.data ?? [], universities: universitiesRes.data ?? [] },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
