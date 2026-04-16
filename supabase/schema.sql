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
create type cost_of_life_enum as enum ('HIGH', 'MEDIUM', 'LOW');

create or replace function safe_int(input text, max_len int default 9) returns int as $$
  select case
    when input is null then null
    when length(input) > max_len then null
    else input::int
  end;
$$ language sql immutable;

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

-- Cities
create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text,
  country text not null,
  average_rent_outside_campus_gbp_per_month integer,
  cost_of_life cost_of_life_enum,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (name, region, country)
);

-- Universities
create table if not exists universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  region text,
  city text,
  city_id uuid references cities(id) on delete set null,
  rank_overall int,
  rank_source text,
  website text,
  intl_tuition_low numeric,
  intl_tuition_high numeric,
  currency text,
  acceptance_rate numeric,
  requires_test boolean default false,
  qs_uk_rank int,
  times_sunday_rank int,
  guardian_rank int,
  acceptance_rate_pct numeric check (acceptance_rate_pct between 0 and 100),
  nss_score_pct numeric check (nss_score_pct between 0 and 100),
  international_students_ratio_pct numeric check (international_students_ratio_pct between 0 and 100),
  student_to_staff_ratio numeric check (student_to_staff_ratio between 0 and 100),
  student_dorm_cost_gbp_per_year integer check (student_dorm_cost_gbp_per_year >= 0),
  average_rent_outside_campus_gbp_per_month_override integer check (average_rent_outside_campus_gbp_per_month_override >= 0),
  cost_of_life_override cost_of_life_enum,
  graduate_employment_rate_pct numeric check (graduate_employment_rate_pct between 0 and 100),
  average_starting_salary_gbp integer check (average_starting_salary_gbp >= 0),
  university_life text,
  number_of_students integer check (number_of_students >= 0),
  transport_accessibility text,
  cultural_social_environment text,
  city_life text,
  climate text,
  safety_index text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
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
  min_ib_score smallint check (min_ib_score between 24 and 45),
  min_a_level_score text,
  a_level_min_numeric smallint check (a_level_min_numeric between 30 and 100),
  preferred_subjects text,
  preferred_subjects_json jsonb,
  english_score_requirement text,
  course_online_page text,
  ucas_deadline text,
  admission_test text,
  interview text,
  nss_score_pct_override numeric check (nss_score_pct_override between 0 and 100),
  intake_size integer check (intake_size >= 0),
  gender_ratio_pct numeric check (gender_ratio_pct between 0 and 100),
  international_students_ratio_pct_override numeric check (international_students_ratio_pct_override between 0 and 100),
  student_to_staff_ratio_override numeric check (student_to_staff_ratio_override between 0 and 100),
  yearly_international_tuition_fee_gbp integer check (yearly_international_tuition_fee_gbp >= 0),
  student_dorm_cost_gbp_per_year_override integer check (student_dorm_cost_gbp_per_year_override >= 0),
  average_rent_outside_campus_gbp_per_month_override integer check (average_rent_outside_campus_gbp_per_month_override >= 0),
  cost_of_life_override cost_of_life_enum,
  university_life_override text,
  study_abroad_option text,
  top_industries text,
  placement_year boolean,
  placement_year_detail text,
  average_starting_salary_gbp_override integer check (average_starting_salary_gbp_override >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
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

create or replace view course_scoring_v1 as
with base as (
  select
    p.id as course_id,
    p.id as program_id,
    p.university_id,
    u.name as university,
    p.course_name as course,
    coalesce(c.name, u.city) as city,
    p.ucas_code,
    coalesce(p.study_level, p.level) as level,
    p.name as degree_type,
    p.field as field_of_study,
    coalesce(p.duration, case when p.duration_years is not null then p.duration_years::text || ' years' end) as duration,
    coalesce(u.acceptance_rate_pct, u.acceptance_rate) as acceptance_rate_pct,
    coalesce(u.qs_uk_rank, nullif(regexp_replace((u.metadata->>'qs_uk_rank'), '[^0-9]', '', 'g'), '')::int) as qs_uk_rank,
    coalesce(u.times_sunday_rank, nullif(regexp_replace((u.metadata->>'times_sunday_rank'), '[^0-9]', '', 'g'), '')::int) as times_sunday_rank,
    coalesce(u.guardian_rank, nullif(regexp_replace((u.metadata->>'guardian_rank'), '[^0-9]', '', 'g'), '')::int) as guardian_rank,
    coalesce(
      p.nss_score_pct_override,
      u.nss_score_pct,
      nullif(regexp_replace((p.metadata->>'nss_score_pct'), '[^0-9.]', '', 'g'), '')::numeric,
      nullif(regexp_replace((p.student_satisfaction), '[^0-9.]', '', 'g'), '')::numeric,
      nullif(regexp_replace((u.metadata->>'nss_score_pct'), '[^0-9.]', '', 'g'), '')::numeric
    ) as nss_score_pct,
    p.intake_size,
    p.gender_ratio_pct,
    coalesce(
      p.international_students_ratio_pct_override,
      u.international_students_ratio_pct,
      nullif(regexp_replace((p.metadata->>'international_students_ratio_pct'), '[^0-9.]', '', 'g'), '')::numeric
    ) as international_students_ratio_pct,
    coalesce(
      p.student_to_staff_ratio_override,
      u.student_to_staff_ratio,
      nullif(regexp_replace((p.metadata->>'student_to_staff_ratio'), '[^0-9.]', '', 'g'), '')::numeric
    ) as student_to_staff_ratio,
    coalesce(
      p.yearly_international_tuition_fee_gbp,
      safe_int(nullif(regexp_replace((p.tuition_fees_international), '[^0-9]', '', 'g'), '')),
      safe_int(nullif(regexp_replace((p.tuition)::text, '[^0-9]', '', 'g'), ''))
    ) as yearly_international_tuition_fee_gbp,
    coalesce(
      p.student_dorm_cost_gbp_per_year_override,
      u.student_dorm_cost_gbp_per_year,
      safe_int(nullif(regexp_replace((p.metadata->>'student_dorm_cost_gbp_per_year'), '[^0-9]', '', 'g'), ''))
    ) as student_dorm_cost_gbp_per_year,
    coalesce(
      p.average_rent_outside_campus_gbp_per_month_override,
      u.average_rent_outside_campus_gbp_per_month_override,
      c.average_rent_outside_campus_gbp_per_month,
      safe_int(nullif(regexp_replace((p.metadata->>'average_rent_outside_campus_gbp_per_month'), '[^0-9]', '', 'g'), ''))
    ) as average_rent_outside_campus_gbp_per_month,
    coalesce(p.cost_of_life_override, u.cost_of_life_override, c.cost_of_life) as cost_of_life,
    coalesce(
      p.min_ib_score,
      case
        when nullif(regexp_replace(coalesce(p.min_ib, ''), '[^0-9]', '', 'g'), '')::int between 24 and 45
          then nullif(regexp_replace(coalesce(p.min_ib, ''), '[^0-9]', '', 'g'), '')::int
        else null
      end
    ) as min_ib_score,
    coalesce(
      p.min_a_level_score,
      p.min_alevel,
      (regexp_match(upper(coalesce(p.entry_requirements_overview, '')), '(A\\*AA|A\\*AB|AAA|AAB|ABB|BBB|BBC|BCC|CCC)'))[1]
    ) as min_a_level_score,
    coalesce(
      p.a_level_min_numeric,
      case
        when upper(regexp_replace(coalesce(
          p.min_a_level_score,
          p.min_alevel,
          (regexp_match(upper(coalesce(p.entry_requirements_overview, '')), '(A\\*AA|A\\*AB|AAA|AAB|ABB|BBB|BBC|BCC|CCC)'))[1]
        ), '\\s+', '', 'g')) like '%A*AA%' then 100
        when upper(regexp_replace(coalesce(
          p.min_a_level_score,
          p.min_alevel,
          (regexp_match(upper(coalesce(p.entry_requirements_overview, '')), '(A\\*AA|A\\*AB|AAA|AAB|ABB|BBB|BBC|BCC|CCC)'))[1]
        ), '\\s+', '', 'g')) = 'A*AB' then 95
        when upper(regexp_replace(coalesce(
          p.min_a_level_score,
          p.min_alevel,
          (regexp_match(upper(coalesce(p.entry_requirements_overview, '')), '(A\\*AA|A\\*AB|AAA|AAB|ABB|BBB|BBC|BCC|CCC)'))[1]
        ), '\\s+', '', 'g')) = 'AAA' then 90
        when upper(regexp_replace(coalesce(
          p.min_a_level_score,
          p.min_alevel,
          (regexp_match(upper(coalesce(p.entry_requirements_overview, '')), '(A\\*AA|A\\*AB|AAA|AAB|ABB|BBB|BBC|BCC|CCC)'))[1]
        ), '\\s+', '', 'g')) = 'AAB' then 80
        when upper(regexp_replace(coalesce(
          p.min_a_level_score,
          p.min_alevel,
          (regexp_match(upper(coalesce(p.entry_requirements_overview, '')), '(A\\*AA|A\\*AB|AAA|AAB|ABB|BBB|BBC|BCC|CCC)'))[1]
        ), '\\s+', '', 'g')) = 'ABB' then 70
        when upper(regexp_replace(coalesce(
          p.min_a_level_score,
          p.min_alevel,
          (regexp_match(upper(coalesce(p.entry_requirements_overview, '')), '(A\\*AA|A\\*AB|AAA|AAB|ABB|BBB|BBC|BCC|CCC)'))[1]
        ), '\\s+', '', 'g')) = 'BBB' then 60
        when upper(regexp_replace(coalesce(
          p.min_a_level_score,
          p.min_alevel,
          (regexp_match(upper(coalesce(p.entry_requirements_overview, '')), '(A\\*AA|A\\*AB|AAA|AAB|ABB|BBB|BBC|BCC|CCC)'))[1]
        ), '\\s+', '', 'g')) = 'BBC' then 50
        when upper(regexp_replace(coalesce(
          p.min_a_level_score,
          p.min_alevel,
          (regexp_match(upper(coalesce(p.entry_requirements_overview, '')), '(A\\*AA|A\\*AB|AAA|AAB|ABB|BBB|BBC|BCC|CCC)'))[1]
        ), '\\s+', '', 'g')) = 'BCC' then 40
        when upper(regexp_replace(coalesce(
          p.min_a_level_score,
          p.min_alevel,
          (regexp_match(upper(coalesce(p.entry_requirements_overview, '')), '(A\\*AA|A\\*AB|AAA|AAB|ABB|BBB|BBC|BCC|CCC)'))[1]
        ), '\\s+', '', 'g')) = 'CCC' then 30
        else null
      end
    ) as a_level_min_numeric,
    p.preferred_subjects,
    p.english_score_requirement,
    coalesce(p.course_online_page, p.provider_course_url, p.url) as course_online_page,
    p.start_date as ucas_deadline,
    coalesce(p.admission_test, p.additional_entry_requirements, p.entry_requirements_overview) as admission_test,
    p.interview,
    coalesce(p.university_life_override, u.university_life) as university_life,
    u.number_of_students,
    u.transport_accessibility,
    u.cultural_social_environment,
    u.city_life,
    u.climate,
    u.safety_index,
    p.study_abroad_option,
    u.graduate_employment_rate_pct,
    coalesce(
      p.average_starting_salary_gbp_override,
      u.average_starting_salary_gbp,
      safe_int(nullif(regexp_replace((p.average_salary_after_15m), '[^0-9]', '', 'g'), ''))
    ) as average_starting_salary_gbp,
    p.top_industries,
    p.placement_year,
    p.placement_year_detail,
    p.language as program_language,
    p.mode as program_mode,
    p.tuition as program_tuition,
    p.currency as program_currency,
    coalesce(p.provider_course_url, p.url) as program_url,
    u.country as university_country,
    u.rank_overall as university_rank_overall,
    u.rank_source as university_rank_source,
    u.requires_test as university_requires_test
  from programs p
  join universities u on u.id = p.university_id
  left join cities c on c.id = u.city_id
),
ranked as (
  select
    *,
    case
      when qs_uk_rank is null then null
      when qs_uk_rank <= 5 then 100
      when qs_uk_rank <= 10 then 95
      when qs_uk_rank <= 20 then 85
      when qs_uk_rank <= 30 then 75
      when qs_uk_rank <= 40 then 65
      when qs_uk_rank <= 60 then 55
      when qs_uk_rank <= 80 then 45
      when qs_uk_rank <= 100 then 35
      else 25
    end as qs_band,
    case
      when times_sunday_rank is null then null
      when times_sunday_rank <= 5 then 100
      when times_sunday_rank <= 10 then 95
      when times_sunday_rank <= 20 then 85
      when times_sunday_rank <= 30 then 75
      when times_sunday_rank <= 40 then 65
      when times_sunday_rank <= 60 then 55
      when times_sunday_rank <= 80 then 45
      when times_sunday_rank <= 100 then 35
      else 25
    end as times_band,
    case
      when guardian_rank is null then null
      when guardian_rank <= 5 then 100
      when guardian_rank <= 10 then 95
      when guardian_rank <= 20 then 85
      when guardian_rank <= 30 then 75
      when guardian_rank <= 40 then 65
      when guardian_rank <= 60 then 55
      when guardian_rank <= 80 then 45
      when guardian_rank <= 100 then 35
      else 25
    end as guardian_band
  from base
),
scores as (
  select
    *,
    case
      when qs_band is null and times_band is null and guardian_band is null then 30
      else round(
        (coalesce(qs_band, 0) + coalesce(times_band, 0) + coalesce(guardian_band, 0))::numeric /
        nullif(
          (case when qs_band is not null then 1 else 0 end) +
          (case when times_band is not null then 1 else 0 end) +
          (case when guardian_band is not null then 1 else 0 end),
          0
        )
      )
    end as university_score,
    case
      when min_ib_score is null then 40
      when min_ib_score >= 40 then 100
      when min_ib_score >= 38 then 90
      when min_ib_score >= 36 then 80
      when min_ib_score >= 34 then 70
      when min_ib_score >= 32 then 60
      when min_ib_score >= 30 then 50
      when min_ib_score >= 28 then 40
      else 30
    end as ib_score,
    case
      when min_a_level_score is null then 40
      when upper(regexp_replace(min_a_level_score, '\\s+', '', 'g')) like '%A*AA%' then 100
      when upper(regexp_replace(min_a_level_score, '\\s+', '', 'g')) = 'A*AB' then 95
      when upper(regexp_replace(min_a_level_score, '\\s+', '', 'g')) = 'AAA' then 90
      when upper(regexp_replace(min_a_level_score, '\\s+', '', 'g')) = 'AAB' then 80
      when upper(regexp_replace(min_a_level_score, '\\s+', '', 'g')) = 'ABB' then 70
      when upper(regexp_replace(min_a_level_score, '\\s+', '', 'g')) = 'BBB' then 60
      when upper(regexp_replace(min_a_level_score, '\\s+', '', 'g')) = 'BBC' then 50
      when upper(regexp_replace(min_a_level_score, '\\s+', '', 'g')) = 'BCC' then 40
      else 30
    end as alevel_score
  from ranked
)
select
  course_id,
  program_id,
  university_id,
  university,
  course,
  city,
  ucas_code,
  level,
  degree_type,
  field_of_study,
  duration,
  acceptance_rate_pct,
  nss_score_pct,
  intake_size,
  gender_ratio_pct,
  international_students_ratio_pct,
  student_to_staff_ratio,
  yearly_international_tuition_fee_gbp,
  student_dorm_cost_gbp_per_year,
  average_rent_outside_campus_gbp_per_month,
  cost_of_life,
  min_ib_score,
  min_a_level_score,
  a_level_min_numeric,
  preferred_subjects,
  english_score_requirement,
  course_online_page,
  ucas_deadline,
  admission_test,
  interview,
  university_life,
  number_of_students,
  transport_accessibility,
  cultural_social_environment,
  city_life,
  climate,
  safety_index,
  study_abroad_option,
  graduate_employment_rate_pct,
  average_starting_salary_gbp,
  top_industries,
  placement_year,
  placement_year_detail,
  program_language,
  program_mode,
  program_tuition,
  program_currency,
  program_url,
  university_country,
  university_rank_overall,
  university_rank_source,
  university_requires_test,
  university_score,
  case
    when min_ib_score is not null and min_a_level_score is not null then round((ib_score + alevel_score) / 2.0)
    when min_ib_score is not null then ib_score
    when min_a_level_score is not null then alevel_score
    else 40
  end as course_selectivity_score,
  round(university_score * 0.6 + (
    case
      when min_ib_score is not null and min_a_level_score is not null then (ib_score + alevel_score) / 2.0
      when min_ib_score is not null then ib_score
      when min_a_level_score is not null then alevel_score
      else 40
    end
  ) * 0.4) as total_course_score,
  case
    when round(university_score * 0.6 + (
      case
        when min_ib_score is not null and min_a_level_score is not null then (ib_score + alevel_score) / 2.0
        when min_ib_score is not null then ib_score
        when min_a_level_score is not null then alevel_score
        else 40
      end
    ) * 0.4) >= 85 then 1
    when round(university_score * 0.6 + (
      case
        when min_ib_score is not null and min_a_level_score is not null then (ib_score + alevel_score) / 2.0
        when min_ib_score is not null then ib_score
        when min_a_level_score is not null then alevel_score
        else 40
      end
    ) * 0.4) >= 75 then 2
    when round(university_score * 0.6 + (
      case
        when min_ib_score is not null and min_a_level_score is not null then (ib_score + alevel_score) / 2.0
        when min_ib_score is not null then ib_score
        when min_a_level_score is not null then alevel_score
        else 40
      end
    ) * 0.4) >= 65 then 3
    when round(university_score * 0.6 + (
      case
        when min_ib_score is not null and min_a_level_score is not null then (ib_score + alevel_score) / 2.0
        when min_ib_score is not null then ib_score
        when min_a_level_score is not null then alevel_score
        else 40
      end
    ) * 0.4) >= 50 then 4
    else 5
  end as course_tier
from scores;

grant select on course_scoring_v1 to anon, authenticated;

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
create index if not exists idx_cities_name on cities(name);
create index if not exists idx_cities_cost_of_life on cities(cost_of_life);
create index if not exists idx_cities_rent on cities(average_rent_outside_campus_gbp_per_month);
create index if not exists idx_universities_name on universities(name);
create index if not exists idx_universities_city_id on universities(city_id);
create index if not exists idx_universities_ranks on universities(qs_uk_rank, times_sunday_rank, guardian_rank);
create index if not exists idx_universities_nss on universities(nss_score_pct);
create index if not exists idx_universities_student_staff on universities(student_to_staff_ratio);
create index if not exists idx_programs_university_id on programs(university_id);
create index if not exists idx_programs_course_name on programs(course_name);
create index if not exists idx_programs_level on programs(level);
create index if not exists idx_programs_degree_type on programs(name);
create index if not exists idx_programs_field on programs(field);
create index if not exists idx_programs_min_ib_score on programs(min_ib_score);
create index if not exists idx_programs_min_a_level_numeric on programs(a_level_min_numeric);
create index if not exists idx_programs_nss_override on programs(nss_score_pct_override);
create index if not exists idx_programs_intake_size on programs(intake_size);
create index if not exists idx_programs_gender_ratio on programs(gender_ratio_pct);
create index if not exists idx_programs_student_staff_override on programs(student_to_staff_ratio_override);
create index if not exists idx_programs_tuition on programs(yearly_international_tuition_fee_gbp);
create index if not exists idx_programs_average_salary_override on programs(average_starting_salary_gbp_override);
create index if not exists idx_programs_university_life_override on programs(university_life_override);
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
