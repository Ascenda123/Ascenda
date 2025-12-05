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

-- Academics
create table if not exists student_academics (
  profile_id uuid primary key references profiles(id) on delete cascade,
  curriculum text,
  gpa numeric,
  ib_total int,
  sat int,
  act int,
  toefl int,
  ielts numeric,
  subject_grades jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

-- Preferences
create table if not exists student_preferences (
  profile_id uuid primary key references profiles(id) on delete cascade,
  budget_min numeric,
  budget_max numeric,
  aid_needed boolean default false,
  countries text[],
  languages text[],
  campus_type campus_type,
  setting setting_type,
  size size_type,
  program_levels text[],
  delivery delivery_type,
  constraints jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

-- Aspirations
create table if not exists student_aspirations (
  profile_id uuid primary key references profiles(id) on delete cascade,
  target_fields text[],
  job_titles text[],
  notes text,
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
  name text not null,
  field text,
  level text,
  duration_years numeric,
  language text,
  mode text,
  intake_months text[],
  tuition numeric,
  currency text,
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
alter table student_academics enable row level security;
alter table student_preferences enable row level security;
alter table student_aspirations enable row level security;
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

-- Academics policies
drop policy if exists academics_self on student_academics;
drop policy if exists academics_admin on student_academics;
create policy academics_self on student_academics
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy academics_admin on student_academics
  using (auth_role() = 'admin');

-- Preferences policies
drop policy if exists preferences_self on student_preferences;
drop policy if exists preferences_admin on student_preferences;
create policy preferences_self on student_preferences
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy preferences_admin on student_preferences
  using (auth_role() = 'admin');

-- Aspirations policies
drop policy if exists aspirations_self on student_aspirations;
drop policy if exists aspirations_admin on student_aspirations;
create policy aspirations_self on student_aspirations
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy aspirations_admin on student_aspirations
  using (auth_role() = 'admin');

-- Catalog policies
drop policy if exists universities_read_all on universities;
drop policy if exists universities_admin on universities;
create policy universities_read_all on universities for select using (true);
create policy universities_admin on universities using (auth_role() = 'admin');

drop policy if exists programs_read_all on programs;
drop policy if exists programs_admin on programs;
create policy programs_read_all on programs for select using (true);
create policy programs_admin on programs using (auth_role() = 'admin');

drop policy if exists requirements_read_all on program_requirements;
drop policy if exists requirements_admin on program_requirements;
create policy requirements_read_all on program_requirements for select using (true);
create policy requirements_admin on program_requirements using (auth_role() = 'admin');

drop policy if exists deadlines_read_all on deadlines;
drop policy if exists deadlines_admin on deadlines;
create policy deadlines_read_all on deadlines for select using (true);
create policy deadlines_admin on deadlines using (auth_role() = 'admin');

drop policy if exists application_tasks_read_all on application_tasks;
drop policy if exists application_tasks_admin on application_tasks;
create policy application_tasks_read_all on application_tasks for select using (true);
create policy application_tasks_admin on application_tasks using (auth_role() = 'admin');

drop policy if exists sources_read_all on sources;
drop policy if exists sources_admin on sources;
create policy sources_read_all on sources for select using (true);
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
          where a.id = split_part(name, '/', 2)
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
