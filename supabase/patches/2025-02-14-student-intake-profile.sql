begin;

drop table if exists student_academics cascade;
drop table if exists student_preferences cascade;
drop table if exists student_aspirations cascade;

drop type if exists programme_type cascade;
drop type if exists intended_cluster cascade;
drop type if exists english_test_type cascade;
drop type if exists english_status cascade;
drop type if exists admissions_test_type cascade;
drop type if exists admissions_status cascade;
drop type if exists gender_type cascade;
drop type if exists school_type cascade;
drop type if exists language_of_instruction cascade;
drop type if exists ib_grade cascade;
drop type if exists ib_math_pathway cascade;
drop type if exists subject_level cascade;
drop type if exists teaching_style cascade;
drop type if exists location_type cascade;
drop type if exists campus_size_preference cascade;

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

create table if not exists student_subjects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  subject_name text,
  level subject_level,
  grade_value text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists student_admissions_tests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  test_type admissions_test_type,
  status admissions_status,
  score_numeric numeric,
  percentile numeric,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists student_lifestyle_preference (
  profile_id uuid primary key references profiles(id) on delete cascade,
  teaching_style teaching_style,
  desired_location_type location_type,
  campus_size campus_size_preference,
  extracurricular_interests text[],
  other_extracurriculars text,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists student_scores (
  profile_id uuid primary key references profiles(id) on delete cascade,
  total_score int,
  student_band text,
  eligibility_flags text[],
  readiness_flags text[],
  breakdown jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table student_personal_information enable row level security;
alter table student_academic_input enable row level security;
alter table student_subjects enable row level security;
alter table student_admissions_tests enable row level security;
alter table student_lifestyle_preference enable row level security;
alter table student_scores enable row level security;

drop policy if exists personal_self on student_personal_information;
drop policy if exists personal_admin on student_personal_information;
create policy personal_self on student_personal_information
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy personal_admin on student_personal_information
  using (auth_role() = 'admin');

drop policy if exists academic_input_self on student_academic_input;
drop policy if exists academic_input_admin on student_academic_input;
create policy academic_input_self on student_academic_input
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy academic_input_admin on student_academic_input
  using (auth_role() = 'admin');

drop policy if exists subjects_self on student_subjects;
drop policy if exists subjects_admin on student_subjects;
create policy subjects_self on student_subjects
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy subjects_admin on student_subjects
  using (auth_role() = 'admin');

drop policy if exists admissions_self on student_admissions_tests;
drop policy if exists admissions_admin on student_admissions_tests;
create policy admissions_self on student_admissions_tests
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy admissions_admin on student_admissions_tests
  using (auth_role() = 'admin');

drop policy if exists lifestyle_self on student_lifestyle_preference;
drop policy if exists lifestyle_admin on student_lifestyle_preference;
create policy lifestyle_self on student_lifestyle_preference
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy lifestyle_admin on student_lifestyle_preference
  using (auth_role() = 'admin');

drop policy if exists scores_self on student_scores;
drop policy if exists scores_admin on student_scores;
create policy scores_self on student_scores
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy scores_admin on student_scores
  using (auth_role() = 'admin');

commit;
