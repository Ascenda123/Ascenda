// Supabase Edge Function placeholder for deadline updates
// Deploy with: supabase functions deploy update_deadlines --no-verify-jwt
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

serve(async (req) => {
  const supabaseClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const body = (await req.json()) as Payload[];

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
