/**
 * Idempotent seed for the May 18 counsellor demo.
 *
 * Ensures `greg@workiflow.com` exists end-to-end:
 *   1. Auth user (created if absent)
 *   2. profiles row with role='student'
 *   3. student_personal_information with email = DEMO_EMAIL (this is the
 *      magic value the matching service / demo helper key off)
 *   4. student_academic_input (A_LEVEL programme, plausible school)
 *   5. student_subjects (3-4 A-Level subjects)
 *   6. student_lifestyle_preference
 *
 * Run with:
 *   npx tsx scripts/seed-demo-user.ts
 *
 * Re-running is safe — every step uses upserts keyed on profile_id.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL (or
 * SUPABASE_URL) in .env.local.
 */

// Load env from .env.local without a dotenv dep.
import * as fs from 'fs';
import * as path from 'path';

const loadEnvFile = (filename: string): void => {
  const filePath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
};

loadEnvFile('.env.local');

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Inlined from src/lib/demo/demo-profile.ts — ts-node's ESM resolver doesn't
// handle the src/ alias here, and a one-string duplicate is cheaper than
// wrestling with module resolution.
const DEMO_EMAIL = 'greg@workiflow.com';

const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD ?? 'AscendaDemo!2026';
const DEMO_FULL_NAME = 'Greg Franck';

const getClient = (): SupabaseClient => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error(
      'Missing env. Need NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env.local'
    );
  }
  return createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
};

const ensureAuthUser = async (supabase: SupabaseClient): Promise<string> => {
  // Try to find an existing user by email. The admin API doesn't have a
  // direct lookup, so paginate listUsers if no env-provided id is given.
  const explicitId = process.env.DEMO_USER_ID;
  if (explicitId) {
    console.log(`  Using DEMO_USER_ID=${explicitId} from env`);
    return explicitId;
  }

  let page = 1;
  // 50 is plenty for a small project; bump if needed.
  for (let i = 0; i < 10; i++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 50 });
    if (error) throw new Error(`listUsers failed: ${error.message}`);
    const match = data.users.find((u) => u.email?.toLowerCase() === DEMO_EMAIL);
    if (match) {
      console.log(`  Found existing auth user ${match.id}`);
      return match.id;
    }
    if (data.users.length < 50) break;
    page += 1;
  }

  console.log(`  Creating auth user ${DEMO_EMAIL}…`);
  const { data, error } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: DEMO_FULL_NAME }
  });
  if (error || !data.user) throw new Error(`createUser failed: ${error?.message}`);
  console.log(`  Created auth user ${data.user.id}`);
  return data.user.id;
};

const upsertProfile = async (supabase: SupabaseClient, profileId: string) => {
  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: profileId,
        role: 'student',
        full_name: DEMO_FULL_NAME,
        country: 'United Kingdom',
        time_zone: 'Europe/London'
      },
      { onConflict: 'id' }
    );
  if (error) throw new Error(`profiles upsert failed: ${error.message}`);
  console.log('  Upserted profiles row');
};

const upsertPersonal = async (supabase: SupabaseClient, profileId: string) => {
  const { error } = await supabase
    .from('student_personal_information')
    .upsert(
      {
        profile_id: profileId,
        first_name: 'Greg',
        last_name: 'Franck',
        email: DEMO_EMAIL,
        phone: '+44 7700 900123',
        nationality: 'British',
        resident_country: 'United Kingdom',
        age: 17,
        gender: 'male',
        current_location_city: 'London',
        time_zone: 'Europe/London'
      },
      { onConflict: 'profile_id' }
    );
  if (error) throw new Error(`student_personal_information upsert failed: ${error.message}`);
  console.log('  Upserted student_personal_information');
};

const upsertAcademic = async (supabase: SupabaseClient, profileId: string) => {
  const { error } = await supabase
    .from('student_academic_input')
    .upsert(
      {
        profile_id: profileId,
        programme_type: 'A_LEVEL',
        school_name: 'St Martin-in-the-Fields High School',
        school_country: 'United Kingdom',
        school_city: 'London',
        graduation_year: 2026,
        a_level_predicted_grades: {
          Mathematics: 'A*',
          Economics: 'A',
          Geography: 'A',
          'Further Mathematics': 'B'
        },
        intended_clusters: ['economics_quant', 'business_non_quant'],
        secondary_clusters: ['humanities'],
        english_status: 'exceptional',
        english_required: false,
        career_aspiration: 'Investment analyst in sustainable finance',
        language_of_instruction: 'english'
      },
      { onConflict: 'profile_id' }
    );
  if (error) throw new Error(`student_academic_input upsert failed: ${error.message}`);
  console.log('  Upserted student_academic_input');
};

const replaceSubjects = async (supabase: SupabaseClient, profileId: string) => {
  await supabase.from('student_subjects').delete().eq('profile_id', profileId);
  const subjects = [
    { profile_id: profileId, subject_name: 'Mathematics', level: 'A_LEVEL', grade_value: 'A*' },
    { profile_id: profileId, subject_name: 'Economics', level: 'A_LEVEL', grade_value: 'A' },
    { profile_id: profileId, subject_name: 'Geography', level: 'A_LEVEL', grade_value: 'A' },
    { profile_id: profileId, subject_name: 'Further Mathematics', level: 'A_LEVEL', grade_value: 'B' }
  ];
  const { error } = await supabase.from('student_subjects').insert(subjects);
  if (error) throw new Error(`student_subjects insert failed: ${error.message}`);
  console.log(`  Inserted ${subjects.length} student_subjects`);
};

const upsertLifestyle = async (supabase: SupabaseClient, profileId: string) => {
  const { error } = await supabase
    .from('student_lifestyle_preference')
    .upsert(
      {
        profile_id: profileId,
        teaching_style: 'mixed',
        campus_size: 'medium',
        desired_location_type: 'major_city',
        extracurricular_interests: ['debate', 'investment_society', 'volunteering']
      },
      { onConflict: 'profile_id' }
    );
  if (error) throw new Error(`student_lifestyle_preference upsert failed: ${error.message}`);
  console.log('  Upserted student_lifestyle_preference');
};

// Real Supabase program IDs (uniid|programid):
// Verified live against the demo db on 2026-05-13.
//   Lancaster Uni / Mathematics with Economics — the Beat-2 demo hero
//   LSE / Economics — Reach
//   Imperial / Economics, Finance & Data Science — Reach
//   Warwick / Mathematics and Statistics — Match
//   Edinburgh / Business and Economics — Match
//   Bristol / Economics — Safe
const DEMO_APPLICATIONS: Array<{
  programId: string;
  label: string;
  status: 'planning' | 'in_progress' | 'submitted' | 'decision' | 'enrolled';
  notes: string;
  priority: number;
  tasks: Array<{ name: string; due_offset_days: number; status: 'todo' | 'doing' | 'done' }>;
}> = [
  {
    programId: '25d8297e-6423-5d81-af25-c4db1039bc72',
    label: 'Lancaster · Mathematics with Economics',
    status: 'in_progress',
    notes: 'Top choice — applied via UCAS, references being collected.',
    priority: 88,
    tasks: [
      { name: 'Submit personal statement final draft', due_offset_days: 5, status: 'doing' },
      { name: 'Confirm reference from Mr Patel (Economics teacher)', due_offset_days: 8, status: 'doing' },
      { name: 'Upload predicted-grades transcript', due_offset_days: 12, status: 'done' },
      { name: 'Attend Lancaster offer-holder open day', due_offset_days: 21, status: 'todo' }
    ]
  },
  {
    programId: 'd904d5b5-813f-5b20-8baf-8f306d48afe9',
    label: 'LSE · Economics',
    status: 'in_progress',
    notes: 'Reach — strong fit on quant side, working on the personal statement narrative.',
    priority: 72,
    tasks: [
      { name: 'Draft personal statement (LSE-tailored hook)', due_offset_days: 3, status: 'doing' },
      { name: 'Register for TMUA', due_offset_days: 18, status: 'todo' },
      { name: 'Reference from Mr Patel', due_offset_days: 8, status: 'doing' }
    ]
  },
  {
    programId: '07119710-c3d8-5af5-9ba0-f36eadee9f74',
    label: 'Imperial · Economics, Finance and Data Science',
    status: 'planning',
    notes: 'Reach — pending decision on whether to apply or focus on Lancaster + LSE.',
    priority: 58,
    tasks: [
      { name: 'Decide whether to apply (deadline 15 Oct)', due_offset_days: 4, status: 'doing' },
      { name: 'Read course handbook + reach out to current student', due_offset_days: 10, status: 'todo' }
    ]
  },
  {
    programId: '2d459bbc-b6d8-5afa-8921-112c9f008711',
    label: 'Warwick · Mathematics and Statistics',
    status: 'in_progress',
    notes: 'Match — comfortable with the entry requirements, just need to finalise statement.',
    priority: 68,
    tasks: [
      { name: 'Tailor personal statement closing paragraph', due_offset_days: 6, status: 'todo' },
      { name: 'Reference from Mr Patel', due_offset_days: 8, status: 'doing' }
    ]
  },
  {
    programId: '6b921543-66d8-5873-a237-e2a9dfa29f98',
    label: 'Edinburgh · Business and Economics',
    status: 'submitted',
    notes: 'Submitted Oct 12 — waiting on decision.',
    priority: 48,
    tasks: [
      { name: 'Prepare for potential alumni interview', due_offset_days: 25, status: 'todo' }
    ]
  },
  {
    programId: '5f267fc2-209d-5965-9d11-fce944150174',
    label: 'Bristol · Economics',
    status: 'submitted',
    notes: 'Safety — submitted, confident on offer.',
    priority: 35,
    tasks: [
      { name: 'Update parents on Bristol offer if it comes through', due_offset_days: 14, status: 'todo' }
    ]
  }
];

const replaceApplications = async (supabase: SupabaseClient, profileId: string) => {
  // Remove existing applications + their checklists for a clean re-seed.
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('profile_id', profileId);
  if (existing && existing.length) {
    const ids = existing.map((r: { id: string }) => r.id);
    await supabase.from('application_checklist').delete().in('application_id', ids);
    await supabase.from('applications').delete().in('id', ids);
  }

  for (const app of DEMO_APPLICATIONS) {
    const { data: inserted, error: appError } = await supabase
      .from('applications')
      .insert({
        profile_id: profileId,
        program_id: app.programId,
        status: app.status,
        notes: app.notes
      })
      .select('id')
      .single();
    if (appError || !inserted) {
      throw new Error(`applications insert failed for ${app.label}: ${appError?.message}`);
    }

    const now = new Date();
    const taskRows = app.tasks.map((task) => {
      const due = new Date(now);
      due.setDate(due.getDate() + task.due_offset_days);
      return {
        application_id: inserted.id,
        task_name: task.name,
        status: task.status,
        due_date: due.toISOString().slice(0, 10)
      };
    });
    const { error: taskError } = await supabase.from('application_checklist').insert(taskRows);
    if (taskError) throw new Error(`application_checklist insert failed for ${app.label}: ${taskError.message}`);

    console.log(`  Seeded ${app.label} (${app.tasks.length} tasks)`);
  }
};

const main = async () => {
  console.log(`Seeding demo user ${DEMO_EMAIL}…`);
  const supabase = getClient();

  const profileId = await ensureAuthUser(supabase);
  await upsertProfile(supabase, profileId);
  await upsertPersonal(supabase, profileId);
  await upsertAcademic(supabase, profileId);
  await replaceSubjects(supabase, profileId);
  await upsertLifestyle(supabase, profileId);
  await replaceApplications(supabase, profileId);

  console.log('\nDone.');
  console.log(`  Profile id: ${profileId}`);
  console.log(`  Email:      ${DEMO_EMAIL}`);
  console.log(`  Password:   ${DEMO_PASSWORD}`);
  console.log('\nLog in, run profile completeness once, then matches will use the demo tier mix.');
};

main().catch((err) => {
  console.error('\nSeed failed:', err);
  process.exit(1);
});
