// Supabase Edge Function for deadline updates
// Deploy with: supabase functions deploy update_deadlines
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.1';

interface Payload {
  program_id: string;
  deadlines: {
    name: string;
    deadline_date: string;
    intake?: string;
    is_rolling?: boolean;
    timezone?: string;
  }[];
}

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const adminSecret = Deno.env.get('ADMIN_FUNCTION_SECRET');

const getBearerToken = (req: Request) => {
  const authHeader = req.headers.get('Authorization') ?? '';
  const [, token] = authHeader.split(' ');
  return token;
};

const requireAdmin = async (req: Request) => {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Server misconfigured');
  }

  const supabaseClient = createClient(supabaseUrl, serviceRoleKey);

  const secretHeader = req.headers.get('x-admin-secret');
  if (adminSecret && secretHeader === adminSecret) {
    return { supabaseClient };
  }

  const token = getBearerToken(req);
  if (!token) {
    return { error: 'Unauthorized', status: 401 as const };
  }

  const {
    data: { user },
    error: userError
  } = await supabaseClient.auth.getUser(token);
  if (userError || !user) {
    return { error: 'Unauthorized', status: 401 as const };
  }

  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    return { error: 'Forbidden', status: 403 as const };
  }

  return { supabaseClient };
};

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = (await req.json()) as Payload[];

  const adminCheck = await requireAdmin(req);
  if ('error' in adminCheck) {
    return new Response(JSON.stringify({ error: adminCheck.error }), {
      status: adminCheck.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const supabaseClient = adminCheck.supabaseClient;

  for (const entry of body) {
    for (const item of entry.deadlines) {
      await supabaseClient.from('deadlines').upsert({
        program_id: entry.program_id,
        name: item.name,
        deadline_date: item.deadline_date,
        intake: item.intake,
        is_rolling: item.is_rolling,
        timezone: item.timezone
      });
    }
  }

  return new Response(JSON.stringify({ status: 'ok' }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
