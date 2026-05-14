-- Extends the help_requests inbox into a full thread surface so the
-- counsellor-side notification drawer can do real work: messaging back,
-- private notes, and lightweight meeting bookings. Demo-permissive RLS;
-- tighten before production rollout.

create table if not exists help_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references help_requests(id) on delete cascade,
  author_profile_id uuid not null references profiles(id) on delete cascade,
  author_role text not null check (author_role in ('student', 'counsellor')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists help_messages_request_idx
  on help_messages (request_id, created_at);

create table if not exists help_notes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references help_requests(id) on delete cascade,
  author_profile_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists help_notes_request_idx
  on help_notes (request_id, created_at desc);

create table if not exists help_meetings (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references help_requests(id) on delete cascade,
  counsellor_profile_id uuid not null references profiles(id) on delete cascade,
  student_profile_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  scheduled_for timestamptz not null,
  duration_minutes int not null default 30,
  location text,
  status text not null default 'proposed' check (status in ('proposed', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists help_meetings_request_idx
  on help_meetings (request_id, scheduled_for);
create index if not exists help_meetings_student_upcoming_idx
  on help_meetings (student_profile_id, scheduled_for);

alter table help_messages enable row level security;
alter table help_notes enable row level security;
alter table help_meetings enable row level security;

drop policy if exists help_messages_demo_all on help_messages;
create policy help_messages_demo_all on help_messages
  for all to authenticated using (true) with check (true);

drop policy if exists help_notes_demo_all on help_notes;
create policy help_notes_demo_all on help_notes
  for all to authenticated using (true) with check (true);

drop policy if exists help_meetings_demo_all on help_meetings;
create policy help_meetings_demo_all on help_meetings
  for all to authenticated using (true) with check (true);

alter publication supabase_realtime add table help_messages;
alter publication supabase_realtime add table help_notes;
alter publication supabase_realtime add table help_meetings;
