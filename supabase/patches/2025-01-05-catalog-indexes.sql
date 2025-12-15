-- Catalog performance helpers
create extension if not exists pg_trgm;

-- Speed up program name search (e.g., ilike on course_name)
create index if not exists idx_programs_course_name_trgm on programs using gin (course_name gin_trgm_ops);

-- Faster lookups per university and UCAS code
create index if not exists idx_programs_university_ucas on programs (university_id, ucas_code);
