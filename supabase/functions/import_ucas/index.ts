// Bulk UCAS catalog import for Supabase (universities -> programs -> requirements).
// Deploy: supabase functions deploy import_ucas
// Invoke with service role key only; payload shape:
// {
//   "universities": [...],
//   "programs": [...],
//   "requirements": [...]
// }
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.1';

type Json = Record<string, unknown>;

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('SERVICE_ROLE_URL');
const SERVICE_ROLE =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
  Deno.env.get('SERVICE_ROLE_KEY') ??
  Deno.env.get('SERVICE_ROLE');
const ADMIN_FUNCTION_SECRET = Deno.env.get('ADMIN_FUNCTION_SECRET');

const getBearerToken = (req: Request) => {
  const authHeader = req.headers.get('Authorization') ?? '';
  const [, token] = authHeader.split(' ');
  return token;
};

const requireAdmin = async (req: Request) => {
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return { error: 'Server misconfigured', status: 500 as const };
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  const secretHeader = req.headers.get('x-admin-secret');
  if (ADMIN_FUNCTION_SECRET && secretHeader === ADMIN_FUNCTION_SECRET) {
    return { supabase };
  }

  const token = getBearerToken(req);
  if (!token) {
    return { error: 'Unauthorized', status: 401 as const };
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return { error: 'Unauthorized', status: 401 as const };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    return { error: 'Forbidden', status: 403 as const };
  }

  return { supabase };
};

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const adminCheck = await requireAdmin(req);
  if ('error' in adminCheck) {
    return new Response(adminCheck.error, { status: adminCheck.status });
  }

  const supabase = adminCheck.supabase;

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
