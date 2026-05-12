-- Tables for the student → counsellor "request help" flow and the navbar
-- notification bell. Permissive RLS for demo; tighten before broader rollout.

create table if not exists help_requests (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references profiles(id) on delete cascade,
  application_id text,
  university text,
  program text,
  subject text not null,
  body text not null,
  status text not null default 'open' check (status in ('open', 'accepted', 'resolved')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  resolved_at timestamptz
);

create index if not exists help_requests_status_created_idx
  on help_requests (status, created_at desc);

create index if not exists help_requests_student_idx
  on help_requests (student_profile_id, created_at desc);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_inbox_idx
  on notifications (profile_id, read_at, created_at desc);

alter table help_requests enable row level security;
alter table notifications enable row level security;

-- Demo-permissive policies. Authenticated users can read/write everything.
-- Replace with per-profile policies before production.
drop policy if exists help_requests_demo_all on help_requests;
create policy help_requests_demo_all on help_requests
  for all to authenticated using (true) with check (true);

drop policy if exists notifications_demo_all on notifications;
create policy notifications_demo_all on notifications
  for all to authenticated using (true) with check (true);

-- Realtime: surface inserts/updates on both tables.
alter publication supabase_realtime add table help_requests;
alter publication supabase_realtime add table notifications;
