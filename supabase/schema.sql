-- Enable extensions
create extension if not exists "pgcrypto";

-- Custom enums
create type campus_type as enum ('urban', 'suburban', 'rural', 'online');
create type setting_type as enum ('public', 'private', 'international', 'other');
create type size_type as enum ('small', 'medium', 'large', 'mega');
create type delivery_type as enum ('in_person', 'online', 'hybrid');
create type application_task_category as enum ('test', 'essay', 'reference', 'visa', 'finance', 'portal');
create type application_status as enum ('planning', 'in_progress', 'submitted', 'decision', 'enrolled');
create type checklist_status as enum ('todo', 'doing', 'done');
create type source_health as enum ('ok', 'stale', 'error');
create type programme_type as enum ('IB', 'A_LEVEL');
create type intended_cluster as enum (
  'computer_science',
  'maths',
  'engineering',
  'life_sciences_biochem',
  'medicine_dentistry',
  'economics_quant',
  'business_non_quant',
  'law',
  'humanities',
  'creative'
);
create type english_test_type as enum ('IELTS', 'TOEFL', 'DUOLINGO', 'WAIVER', 'NONE');
create type english_status as enum ('met', 'exceeds', 'exceptional', 'booked', 'missing', 'failed');
create type admissions_test_type as enum ('LNAT', 'UCAT', 'TMUA', 'MAT', 'STEP', 'ESAT', 'TSA', 'NONE');
create type admissions_status as enum ('taken', 'booked', 'missing');
create type gender_type as enum ('female', 'male', 'non_binary', 'prefer_not_to_say');
create type school_type as enum ('international_school', 'local_private', 'state_public', 'boarding', 'other');
create type language_of_instruction as enum ('english', 'bilingual', 'non_english');
create type ib_grade as enum ('A', 'B', 'C', 'D', 'E');
create type ib_math_pathway as enum ('AA_HL', 'AA_SL', 'AI_HL', 'AI_SL');
create type subject_level as enum ('HL', 'SL', 'A_LEVEL');
create type teaching_style as enum ('academic', 'practical', 'mixed');
create type location_type as enum ('london', 'major_city', 'smaller_city', 'suburban', 'no_preference');
create type campus_size_preference as enum ('small', 'medium', 'large', 'no_preference');

-- Profiles
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  role text not null default 'student' check (role in ('student', 'counselor', 'admin')),
  full_name text,
  country text,
  locale text,
  time_zone text,
  created_at timestamptz not null default timezone('utc', now())
);

-- Personal information
create table if not exists student_personal_information (
  profile_id uuid primary key references profiles(id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  phone text,
  nationality text,
  age int,
  gender gender_type,
  resident_country text,
  current_location_city text,
  time_zone text,
  updated_at timestamptz not null default timezone('utc', now())
);

-- Academic input
create table if not exists student_academic_input (
  profile_id uuid primary key references profiles(id) on delete cascade,
  programme_type programme_type,
  school_name text,
  school_country text,
  school_city text,
  school_type school_type,
  language_of_instruction language_of_instruction,
  graduation_year int,
  desired_start_date date,
  intended_clusters intended_cluster[],
  secondary_clusters intended_cluster[],
  career_aspiration text,
  ib_total_points int,
  ib_core_points int,
  ib_tok_grade ib_grade,
  ib_ee_grade ib_grade,
  ib_math_pathway ib_math_pathway,
  ee_subject text,
  ee_title text,
  ee_summary text,
  a_level_predicted_grades jsonb,
  english_required boolean,
  english_test_type english_test_type,
  english_status english_status,
  english_score_overall numeric,
  updated_at timestamptz not null default timezone('utc', now())
);

-- Subjects
create table if not exists student_subjects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  subject_name text,
  level subject_level,
  grade_value text,
  created_at timestamptz not null default timezone('utc', now())
);

-- Admissions tests
create table if not exists student_admissions_tests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  test_type admissions_test_type,
  status admissions_status,
  score_numeric numeric,
  percentile numeric,
  created_at timestamptz not null default timezone('utc', now())
);

-- Lifestyle preferences
create table if not exists student_lifestyle_preference (
  profile_id uuid primary key references profiles(id) on delete cascade,
  teaching_style teaching_style,
  desired_location_type location_type,
  campus_size campus_size_preference,
  extracurricular_interests text[],
  other_extracurriculars text,
  updated_at timestamptz not null default timezone('utc', now())
);

-- Student scores
create table if not exists student_scores (
  profile_id uuid primary key references profiles(id) on delete cascade,
  total_score int,
  student_band text,
  eligibility_flags text[],
  readiness_flags text[],
  breakdown jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

-- Sources
create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  last_scraped_at timestamptz,
  health source_health not null default 'ok',
  notes text
);

-- Universities
create table if not exists universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  region text,
  city text,
  rank_overall int,
  rank_source text,
  website text,
  intl_tuition_low numeric,
  intl_tuition_high numeric,
  currency text,
  acceptance_rate numeric,
  requires_test boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

-- Programs
create table if not exists programs (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references universities(id) on delete cascade,
  name text,
  course_name text not null,
  field text,
  study_level text,
  level text,
  duration text,
  duration_years numeric,
  start_date text,
  campus text,
  language text,
  mode text,
  intake_months text[],
  tuition numeric,
  currency text,
  course_summary text,
  modules text,
  assessment_methods text,
  provider_course_url text,
  provider_apply_url text,
  ucas_code text,
  min_alevel text,
  min_ib text,
  ucas_points text,
  subject_requirements text,
  entry_requirements_overview text,
  additional_entry_requirements text,
  subsequent_year_entry_requirements text,
  english_requirements text,
  contextual_admissions text,
  tuition_fees_international text,
  tuition_fees_home text,
  additional_fee_info text,
  student_satisfaction text,
  employment_after_course text,
  student_outcomes text,
  average_salary_after_15m text,
  historic_entry_grades text,
  open_days text,
  url text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

-- Program requirements
create table if not exists program_requirements (
  program_id uuid primary key references programs(id) on delete cascade,
  curriculum text,
  min_gpa numeric,
  min_ib_total int,
  min_sat int,
  min_act int,
  required_subjects text[],
  language_tests jsonb,
  other_requirements text
);

-- Deadlines
create table if not exists deadlines (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  name text not null,
  deadline_date date,
  intake text,
  is_rolling boolean default false,
  timezone text,
  source_id uuid references sources(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

-- Application tasks master data
create table if not exists application_tasks (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  name text not null,
  description text,
  due_offset_days int,
  category application_task_category not null
);

-- Student matches
create table if not exists student_matches (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  program_id uuid not null references programs(id) on delete cascade,
  score numeric,
  breakdown jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

-- Applications
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  program_id uuid not null references programs(id) on delete cascade,
  status application_status not null default 'planning',
  portal_url text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Checklist items
create table if not exists application_checklist (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  task_name text not null,
  due_date date,
  status checklist_status not null default 'todo'
);

-- Documents
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  name text not null,
  type text,
  storage_path text not null,
  uploaded_at timestamptz not null default timezone('utc', now())
);

-- Shortlisted programs
create table if not exists shortlisted_programs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  program_id uuid not null references programs(id) on delete cascade,
  program_name text,
  university_name text,
  location text,
  stage text,
  fit_score numeric,
  next_action text,
  due_date text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique(profile_id, program_id)
);

-- Indexes
create index if not exists idx_programs_field on programs(field);
create index if not exists idx_deadlines_date on deadlines(deadline_date);
create index if not exists idx_student_matches_profile_score on student_matches(profile_id, score desc);
create index if not exists idx_applications_profile on applications(profile_id);
create index if not exists idx_documents_application on documents(application_id);
create index if not exists idx_shortlisted_profile on shortlisted_programs(profile_id);

-- Row Level Security
alter table profiles enable row level security;
alter table student_personal_information enable row level security;
alter table student_academic_input enable row level security;
alter table student_subjects enable row level security;
alter table student_admissions_tests enable row level security;
alter table student_lifestyle_preference enable row level security;
alter table student_scores enable row level security;
alter table universities enable row level security;
alter table programs enable row level security;
alter table program_requirements enable row level security;
alter table deadlines enable row level security;
alter table application_tasks enable row level security;
alter table student_matches enable row level security;
alter table applications enable row level security;
alter table application_checklist enable row level security;
alter table documents enable row level security;
alter table sources enable row level security;
alter table shortlisted_programs enable row level security;

-- Helper function for role
create or replace function auth_role() returns text as $$
  select coalesce(
    (select role from profiles where id = auth.uid()),
    'student'
  );
$$ language sql stable;

-- Profiles policies
drop policy if exists profiles_self_access on profiles;
drop policy if exists profiles_admin_view on profiles;
create policy profiles_self_access on profiles
  using (auth.uid() = id) with check (auth.uid() = id);
create policy profiles_admin_view on profiles
  for select using (auth_role() = 'admin');

-- Student personal policies
drop policy if exists personal_self on student_personal_information;
drop policy if exists personal_admin on student_personal_information;
create policy personal_self on student_personal_information
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy personal_admin on student_personal_information
  using (auth_role() = 'admin');

-- Student academic input policies
drop policy if exists academic_input_self on student_academic_input;
drop policy if exists academic_input_admin on student_academic_input;
create policy academic_input_self on student_academic_input
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy academic_input_admin on student_academic_input
  using (auth_role() = 'admin');

-- Student subjects policies
drop policy if exists subjects_self on student_subjects;
drop policy if exists subjects_admin on student_subjects;
create policy subjects_self on student_subjects
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy subjects_admin on student_subjects
  using (auth_role() = 'admin');

-- Admissions tests policies
drop policy if exists admissions_self on student_admissions_tests;
drop policy if exists admissions_admin on student_admissions_tests;
create policy admissions_self on student_admissions_tests
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy admissions_admin on student_admissions_tests
  using (auth_role() = 'admin');

-- Lifestyle preferences policies
drop policy if exists lifestyle_self on student_lifestyle_preference;
drop policy if exists lifestyle_admin on student_lifestyle_preference;
create policy lifestyle_self on student_lifestyle_preference
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy lifestyle_admin on student_lifestyle_preference
  using (auth_role() = 'admin');

-- Student scores policies
drop policy if exists scores_self on student_scores;
drop policy if exists scores_admin on student_scores;
create policy scores_self on student_scores
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy scores_admin on student_scores
  using (auth_role() = 'admin');

-- Catalog policies
drop policy if exists universities_read_all on universities;
drop policy if exists universities_admin on universities;
create policy universities_read_all on universities for select using (auth.uid() is not null);
create policy universities_admin on universities using (auth_role() = 'admin');

drop policy if exists programs_read_all on programs;
drop policy if exists programs_admin on programs;
create policy programs_read_all on programs for select using (auth.uid() is not null);
create policy programs_admin on programs using (auth_role() = 'admin');

drop policy if exists requirements_read_all on program_requirements;
drop policy if exists requirements_admin on program_requirements;
create policy requirements_read_all on program_requirements for select using (auth.uid() is not null);
create policy requirements_admin on program_requirements using (auth_role() = 'admin');

drop policy if exists deadlines_read_all on deadlines;
drop policy if exists deadlines_admin on deadlines;
create policy deadlines_read_all on deadlines for select using (auth.uid() is not null);
create policy deadlines_admin on deadlines using (auth_role() = 'admin');

drop policy if exists application_tasks_read_all on application_tasks;
drop policy if exists application_tasks_admin on application_tasks;
create policy application_tasks_read_all on application_tasks for select using (auth.uid() is not null);
create policy application_tasks_admin on application_tasks using (auth_role() = 'admin');

drop policy if exists sources_read_all on sources;
drop policy if exists sources_admin on sources;
create policy sources_read_all on sources for select using (auth.uid() is not null);
create policy sources_admin on sources using (auth_role() = 'admin');

-- Matches policies
drop policy if exists matches_self on student_matches;
drop policy if exists matches_self_write on student_matches;
drop policy if exists matches_self_update on student_matches;
drop policy if exists matches_admin on student_matches;
create policy matches_self on student_matches
  for select using (auth.uid() = profile_id);
create policy matches_self_write on student_matches
  for insert with check (auth.uid() = profile_id);
create policy matches_self_update on student_matches
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy matches_admin on student_matches using (auth_role() = 'admin');

-- Shortlist policies
drop policy if exists shortlist_self on shortlisted_programs;
drop policy if exists shortlist_self_update on shortlisted_programs;
drop policy if exists shortlist_self_insert on shortlisted_programs;
drop policy if exists shortlist_self_delete on shortlisted_programs;
drop policy if exists shortlist_admin on shortlisted_programs;
create policy shortlist_self on shortlisted_programs
  for select using (auth.uid() = profile_id);
create policy shortlist_self_update on shortlisted_programs
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy shortlist_self_insert on shortlisted_programs
  for insert with check (auth.uid() = profile_id);
create policy shortlist_self_delete on shortlisted_programs
  for delete using (auth.uid() = profile_id);
create policy shortlist_admin on shortlisted_programs using (auth_role() = 'admin');

-- Applications policies
drop policy if exists applications_self on applications;
drop policy if exists applications_admin on applications;
create policy applications_self on applications
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy applications_admin on applications using (auth_role() = 'admin');

drop policy if exists checklist_self on application_checklist;
drop policy if exists checklist_admin on application_checklist;
create policy checklist_self on application_checklist
  using (
    exists (
      select 1
      from applications a
      where a.id = application_checklist.application_id
        and a.profile_id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from applications a
      where a.id = application_checklist.application_id
        and a.profile_id = auth.uid()
    )
  );
create policy checklist_admin on application_checklist using (auth_role() = 'admin');

drop policy if exists documents_self on documents;
drop policy if exists documents_admin on documents;
create policy documents_self on documents
  using (
    exists (
      select 1
      from applications a
      where a.id = documents.application_id
        and a.profile_id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from applications a
      where a.id = documents.application_id
        and a.profile_id = auth.uid()
    )
  );
create policy documents_admin on documents using (auth_role() = 'admin');

-- Storage bucket and policies for application documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'application-documents',
  'application-documents',
  false,
  20971520, -- 20 MB
  array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

alter table storage.objects enable row level security;

drop policy if exists application_documents_read on storage.objects;
drop policy if exists application_documents_insert on storage.objects;
drop policy if exists application_documents_update on storage.objects;
drop policy if exists application_documents_delete on storage.objects;
drop policy if exists application_documents_admin on storage.objects;

create policy application_documents_read on storage.objects
  for select using (
    bucket_id = 'application-documents'
    and (
      (
        split_part(name, '/', 1) = 'applications'
        and exists (
          select 1 from applications a
          where a.id::text = split_part(name, '/', 2)
            and a.profile_id = auth.uid()
        )
      )
      or (
        split_part(name, '/', 1) = 'unassigned'
        and split_part(name, '/', 2) = auth.uid()::text
      )
    )
  );

create policy application_documents_insert on storage.objects
  for insert with check (
    bucket_id = 'application-documents'
    and (
      (
        split_part(name, '/', 1) = 'applications'
        and exists (
          select 1 from applications a
          where a.id::text = split_part(name, '/', 2)
            and a.profile_id = auth.uid()
        )
      )
      or (
        split_part(name, '/', 1) = 'unassigned'
        and split_part(name, '/', 2) = auth.uid()::text
      )
    )
  );

create policy application_documents_update on storage.objects
  for update using (
    bucket_id = 'application-documents'
    and (
      (
        split_part(name, '/', 1) = 'applications'
        and exists (
          select 1 from applications a
          where a.id::text = split_part(name, '/', 2)
            and a.profile_id = auth.uid()
        )
      )
      or (
        split_part(name, '/', 1) = 'unassigned'
        and split_part(name, '/', 2) = auth.uid()::text
      )
    )
  ) with check (
    bucket_id = 'application-documents'
    and (
      (
        split_part(name, '/', 1) = 'applications'
        and exists (
          select 1 from applications a
          where a.id::text = split_part(name, '/', 2)
            and a.profile_id = auth.uid()
        )
      )
      or (
        split_part(name, '/', 1) = 'unassigned'
        and split_part(name, '/', 2) = auth.uid()::text
      )
    )
  );

create policy application_documents_delete on storage.objects
  for delete using (
    bucket_id = 'application-documents'
    and (
      (
        split_part(name, '/', 1) = 'applications'
        and exists (
          select 1 from applications a
          where a.id::text = split_part(name, '/', 2)
            and a.profile_id = auth.uid()
        )
      )
      or (
        split_part(name, '/', 1) = 'unassigned'
        and split_part(name, '/', 2) = auth.uid()::text
      )
    )
  );

create policy application_documents_admin on storage.objects
  using (
    bucket_id = 'application-documents'
    and public.auth_role() = 'admin'
  );
