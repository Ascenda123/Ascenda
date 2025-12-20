import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';
import { loadMatchesForProfile } from '@/lib/matching/service';

const loadEnv = () => {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const contents = fs.readFileSync(envPath, 'utf-8');
  contents.split('\n').forEach((line: string) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...rest] = trimmed.split('=');
    if (!key || rest.length === 0) return;
    if (process.env[key]) return;
    process.env[key] = rest.join('=').replace(/^"|"$/g, '');
  });
};

const main = async () => {
  loadEnv();
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    throw new Error('SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required.');
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRole, {
    auth: { persistSession: false }
  });

  const { data: profileRow, error } = await supabase
    .from('student_academic_input')
    .select('profile_id')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !profileRow?.profile_id) {
    throw new Error(error?.message ?? 'No profile found');
  }

  const result = await loadMatchesForProfile(supabase, profileRow.profile_id, { resultLimit: 20 });

  console.log('Profile', profileRow.profile_id);
  console.log('Missing sections', result.missingSections);
  if (result.error) {
    console.log('Error', result.error);
    return;
  }
  console.log('Catalog size', result.catalogSize);
  console.log('Matches', result.matches.length);
  const excludedCount = result.matches.filter((match) => match.blockingReasons?.length).length;
  console.log('Matches with blocking reasons', excludedCount);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
