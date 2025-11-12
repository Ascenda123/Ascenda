insert into profiles (id, role, full_name, country)
values
  ('11111111-1111-1111-1111-111111111111', 'admin', 'Admin User', 'SG')
  on conflict (id) do update set role = excluded.role;

insert into profiles (id, role, full_name, country)
values
  ('22222222-2222-2222-2222-222222222222', 'student', 'Student One', 'IN')
  on conflict (id) do update set full_name = excluded.full_name;

insert into universities (id, name, country, region, city, rank_overall, rank_source, website, intl_tuition_low, intl_tuition_high, currency, acceptance_rate, requires_test)
values
  ('33333333-3333-3333-3333-333333333333', 'Global Tech University', 'United States', 'North America', 'San Francisco', 25, 'QS', 'https://gtech.example.com', 32000, 45000, 'USD', 0.35, true)
  on conflict (id) do update set name = excluded.name;

insert into programs (id, university_id, name, field, level, duration_years, language, mode, intake_months, tuition, currency, url)
values
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'BSc Computer Science', 'Computer Science', 'Undergraduate', 4, 'English', 'On-campus', array['August'], 38000, 'USD', 'https://gtech.example.com/cs')
  on conflict (id) do update set name = excluded.name;

insert into program_requirements (program_id, curriculum, min_gpa, min_ib_total, min_sat, required_subjects, language_tests)
values
  ('44444444-4444-4444-4444-444444444444', 'IB', 3.2, 32, 1300, array['Mathematics HL'], jsonb_build_object('ielts', 6.5, 'toefl', 95))
  on conflict (program_id) do update set curriculum = excluded.curriculum;

insert into deadlines (id, program_id, name, deadline_date, intake, is_rolling, timezone)
values
  ('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'Regular Decision', '2025-01-15', 'Fall 2025', false, 'America/Los_Angeles')
  on conflict (id) do update set deadline_date = excluded.deadline_date;

insert into application_tasks (id, program_id, name, description, due_offset_days, category)
values
  ('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', 'Submit Personal Essay', 'Upload personal statement to portal.', 30, 'essay')
  on conflict (id) do update set name = excluded.name;
