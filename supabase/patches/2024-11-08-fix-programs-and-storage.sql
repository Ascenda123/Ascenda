-- Align programs table with app/import expectations
alter table if exists programs add column if not exists name text;
alter table if exists programs add column if not exists field text;
alter table if exists programs add column if not exists level text;
alter table if exists programs add column if not exists duration_years numeric;
alter table if exists programs add column if not exists language text;
alter table if exists programs add column if not exists mode text;
alter table if exists programs add column if not exists intake_months text[];
alter table if exists programs add column if not exists tuition numeric;
alter table if exists programs add column if not exists currency text;
alter table if exists programs add column if not exists url text;
alter table if exists programs add column if not exists metadata jsonb;
alter table if exists programs alter column metadata set default '{}'::jsonb;

-- Recreate field index now that the column exists
drop index if exists idx_programs_field;
create index if not exists idx_programs_field on programs(field);

-- Fix storage policy casting for application-documents bucket
drop policy if exists application_documents_delete on storage.objects;
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
