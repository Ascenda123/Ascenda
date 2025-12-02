// Bulk UCAS catalog import for Supabase (universities -> programs -> requirements).
// Deploy: supabase functions deploy import_ucas --no-verify-jwt
// Invoke with service role key only; payload shape:
// {
//   "universities": [...],
//   "programs": [...],
//   "requirements": [...]
// }
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.1';

type Json = Record<string, unknown>;

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('SERVICE_ROLE_URL');
  const serviceRole =
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
    Deno.env.get('SERVICE_ROLE_KEY') ??
    Deno.env.get('SERVICE_ROLE');
  if (!supabaseUrl || !serviceRole) {
    return new Response('Server misconfigured', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRole);

  let body: {
    universities?: Json[];
    programs?: Json[];
    requirements?: Json[];
  };

  try {
    body = (await req.json()) as typeof body;
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const universities = body.universities ?? [];
  const programs = body.programs ?? [];
  const requirements = body.requirements ?? [];

  try {
    if (universities.length) {
      const { error } = await supabase.from('universities').upsert(universities, { onConflict: 'id' });
      if (error) throw error;
    }
    if (programs.length) {
      const { error } = await supabase.from('programs').upsert(programs, { onConflict: 'id' });
      if (error) throw error;
    }
    if (requirements.length) {
      const { error } = await supabase.from('program_requirements').upsert(requirements, { onConflict: 'program_id' });
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({
        status: 'ok',
        counts: {
          universities: universities.length,
          programs: programs.length,
          requirements: requirements.length
        }
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
