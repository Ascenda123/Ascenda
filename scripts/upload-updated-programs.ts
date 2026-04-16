import fs from 'fs';
import path from 'path';
// @ts-ignore - papaparse has no bundled types here
import Papa from 'papaparse';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

type CsvProgramRow = {
  university: string;
  course_name: string;
  ucas_code?: string;
  study_level?: string;
  duration?: string;
  start_date?: string;
  campus?: string;
  course_summary?: string;
  modules?: string;
  assessment_methods?: string;
  provider_course_url?: string;
  provider_apply_url?: string;
  min_alevel?: string;
  min_ib?: string;
  ucas_points?: string;
  subject_requirements?: string;
  entry_requirements_overview?: string;
  additional_entry_requirements?: string;
  subsequent_year_entry_requirements?: string;
  english_requirements?: string;
  contextual_admissions?: string;
  tuition_fees_international?: string;
  tuition_fees_home?: string;
  additional_fee_info?: string;
  student_satisfaction?: string;
  employment_after_course?: string;
  student_outcomes?: string;
  average_salary_after_15m?: string;
  historic_entry_grades?: string;
  open_days?: string;
};

type UniversityRow = {
  id: string;
  name: string;
  country: string;
};

type ProgramInsert = {
  id: string;
  university_id: string;
  course_name: string;
  name?: string | null;
  ucas_code?: string | null;
  study_level?: string | null;
  duration?: string | null;
  start_date?: string | null;
  campus?: string | null;
  course_summary?: string | null;
  modules?: string | null;
  assessment_methods?: string | null;
  provider_course_url?: string | null;
  provider_apply_url?: string | null;
  min_alevel?: string | null;
  min_ib?: string | null;
  ucas_points?: string | null;
  subject_requirements?: string | null;
  entry_requirements_overview?: string | null;
  additional_entry_requirements?: string | null;
  subsequent_year_entry_requirements?: string | null;
  english_requirements?: string | null;
  contextual_admissions?: string | null;
  tuition_fees_international?: string | null;
  tuition_fees_home?: string | null;
  additional_fee_info?: string | null;
  student_satisfaction?: string | null;
  employment_after_course?: string | null;
  student_outcomes?: string | null;
  average_salary_after_15m?: string | null;
  historic_entry_grades?: string | null;
  open_days?: string | null;
  min_ib_score?: number | null;
  min_a_level_score?: string | null;
  a_level_min_numeric?: number | null;
  preferred_subjects?: string | null;
  english_score_requirement?: string | null;
  course_online_page?: string | null;
  ucas_deadline?: string | null;
  admission_test?: string | null;
  yearly_international_tuition_fee_gbp?: number | null;
};

const DEFAULT_COUNTRY = 'United Kingdom';
const UUID_NAMESPACE = 'ascenda-ucas-namespace';
const BATCH_SIZE = 500;

const uuidFromString = (value: string): string => {
  const hash = crypto.createHash('sha1').update(UUID_NAMESPACE + value).digest();
  // Set version 5 and variant bits.
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = hash.toString('hex').slice(0, 32);
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32)
  ].join('-');
};

const trimOrUndefined = (value?: string | null): string | undefined => {
  if (value === undefined || value === null) return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

const normalizeALevelProfile = (value?: string | null): string | null => {
  if (!value) return null;
  const match = value.toUpperCase().match(/A\\*AA|A\\*AB|AAA|AAB|ABB|BBB|BBC|BCC|CCC/);
  return match ? match[0] : null;
};

const mapALevelNumeric = (value?: string | null): number | null => {
  const profile = normalizeALevelProfile(value);
  if (!profile) return null;
  if (profile.includes('A*AA')) return 100;
  if (profile === 'A*AB') return 95;
  if (profile === 'AAA') return 90;
  if (profile === 'AAB') return 80;
  if (profile === 'ABB') return 70;
  if (profile === 'BBB') return 60;
  if (profile === 'BBC') return 50;
  if (profile === 'BCC') return 40;
  if (profile === 'CCC') return 30;
  return null;
};

const parseIbTotal = (value?: string | null): number | null => {
  if (!value) return null;
  const match = value.match(/(\\d{2})/);
  if (!match) return null;
  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < 24 || parsed > 45) return null;
  return parsed;
};

const parseMoney = (value?: string | null): number | null => {
  const cleaned = trimOrUndefined(value);
  if (!cleaned) return null;
  const numeric = cleaned.replace(/[^0-9.]/g, '');
  if (!numeric) return null;
  const parsed = Number(numeric);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
};

const chunk = <T,>(items: T[], size: number): T[][] => {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
};

const readCsv = (filePath: string): CsvProgramRow[] => {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Input file not found: ${absolutePath}`);
  }

  const contents = fs.readFileSync(absolutePath, 'utf-8');
  const parsed = Papa.parse(contents, { header: true, skipEmptyLines: true });
  if (parsed.errors.length) {
    const message = parsed.errors.map((e: any) => `${e.message} at row ${e.row}`).join('; ');
    throw new Error(`CSV parse errors: ${message}`);
  }

  return parsed.data
    .map((row: any) => {
      const university = trimOrUndefined(row.university);
      const courseName = trimOrUndefined(row.course_name);
      if (!university || !courseName) return null;

      const normalized: CsvProgramRow = {
        university,
        course_name: courseName
      };

      const optionalKeys: (keyof CsvProgramRow)[] = [
        'ucas_code',
        'study_level',
        'duration',
        'start_date',
        'campus',
        'course_summary',
        'modules',
        'assessment_methods',
        'provider_course_url',
        'provider_apply_url',
        'min_alevel',
        'min_ib',
        'ucas_points',
        'subject_requirements',
        'entry_requirements_overview',
        'additional_entry_requirements',
        'subsequent_year_entry_requirements',
        'english_requirements',
        'contextual_admissions',
        'tuition_fees_international',
        'tuition_fees_home',
        'additional_fee_info',
        'student_satisfaction',
        'employment_after_course',
        'student_outcomes',
        'average_salary_after_15m',
        'historic_entry_grades',
        'open_days'
      ];

      optionalKeys.forEach((key) => {
        const value = trimOrUndefined(row[key]);
        if (value !== undefined) {
          normalized[key] = value;
        }
      });

      return normalized;
    })
    .filter((row: CsvProgramRow | null): row is CsvProgramRow => row !== null);
};

const buildUniversities = (rows: CsvProgramRow[]): UniversityRow[] => {
  const map = new Map<string, UniversityRow>();
  rows.forEach((row) => {
    if (map.has(row.university)) return;
    map.set(row.university, {
      id: uuidFromString(`uni:${row.university}`),
      name: row.university,
      country: DEFAULT_COUNTRY
    });
  });
  return Array.from(map.values());
};

const buildPrograms = (
  rows: CsvProgramRow[],
  uniMap: Map<string, UniversityRow>
): { programs: ProgramInsert[]; duplicateCount: number } => {
  const programMap = new Map<string, ProgramInsert>();
  let duplicateCount = 0;

  rows.forEach((row) => {
    const uni = uniMap.get(row.university);
    if (!uni) {
      throw new Error(`Missing university mapping for ${row.university}`);
    }
    const id = uuidFromString(`program:${uni.id}:${row.course_name}:${row.ucas_code || ''}`);
    if (programMap.has(id)) {
      duplicateCount += 1;
      return;
    }
    programMap.set(id, {
      id,
      university_id: uni.id,
      name: row.course_name,
      course_name: row.course_name,
      ucas_code: row.ucas_code ?? null,
      study_level: row.study_level ?? null,
      duration: row.duration ?? null,
      start_date: row.start_date ?? null,
      campus: row.campus ?? null,
      course_summary: row.course_summary ?? null,
      modules: row.modules ?? null,
      assessment_methods: row.assessment_methods ?? null,
      provider_course_url: row.provider_course_url ?? null,
      provider_apply_url: row.provider_apply_url ?? null,
      min_alevel: row.min_alevel ?? null,
      min_ib: row.min_ib ?? null,
      ucas_points: row.ucas_points ?? null,
      subject_requirements: row.subject_requirements ?? null,
      entry_requirements_overview: row.entry_requirements_overview ?? null,
      additional_entry_requirements: row.additional_entry_requirements ?? null,
      subsequent_year_entry_requirements: row.subsequent_year_entry_requirements ?? null,
      english_requirements: row.english_requirements ?? null,
      contextual_admissions: row.contextual_admissions ?? null,
      tuition_fees_international: row.tuition_fees_international ?? null,
      tuition_fees_home: row.tuition_fees_home ?? null,
      additional_fee_info: row.additional_fee_info ?? null,
      student_satisfaction: row.student_satisfaction ?? null,
      employment_after_course: row.employment_after_course ?? null,
      student_outcomes: row.student_outcomes ?? null,
      average_salary_after_15m: row.average_salary_after_15m ?? null,
      historic_entry_grades: row.historic_entry_grades ?? null,
      open_days: row.open_days ?? null,
      min_ib_score: parseIbTotal(row.min_ib),
      min_a_level_score: normalizeALevelProfile(row.min_alevel),
      a_level_min_numeric: mapALevelNumeric(row.min_alevel),
      preferred_subjects: row.subject_requirements ?? null,
      english_score_requirement: row.english_requirements ?? null,
      course_online_page: row.provider_course_url ?? null,
      ucas_deadline: row.start_date ?? null,
      admission_test: row.additional_entry_requirements ?? null,
      yearly_international_tuition_fee_gbp: parseMoney(row.tuition_fees_international) ?? null
    });
  });

  return { programs: Array.from(programMap.values()), duplicateCount };
};

const upsertUniversities = async (universities: UniversityRow[]) => {
  if (!universities.length) return;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    throw new Error('SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required.');
  }
  const supabase = createClient(supabaseUrl, serviceRole);
  for (const batch of chunk(universities, BATCH_SIZE)) {
    const { error } = await supabase.from('universities').upsert(batch, { onConflict: 'id' });
    if (error) {
      throw new Error(`University upsert failed: ${error.message}`);
    }
  }
};

const replacePrograms = async (programs: ProgramInsert[]) => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    throw new Error('SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required.');
  }
  const supabase = createClient(supabaseUrl, serviceRole);

  const { error: deleteError } = await supabase
    .from('programs')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    throw new Error(`Failed to clear programs table: ${deleteError.message}`);
  }

  for (const batch of chunk(programs, BATCH_SIZE)) {
    const { error } = await supabase.from('programs').insert(batch);
    if (error) {
      throw new Error(`Program insert failed: ${error.message}`);
    }
  }
};

const main = async () => {
  const inputFlagIndex = process.argv.indexOf('--input');
  const inputPath =
    inputFlagIndex !== -1
      ? process.argv[inputFlagIndex + 1]
      : '/Users/gregfranck/UCAS Data Scraper/Updated Course List.csv';

  const rows = readCsv(inputPath);
  console.log(`Read ${rows.length} program rows from CSV.`);

  const universities = buildUniversities(rows);
  console.log(`Identified ${universities.length} unique universities.`);

  const uniMap = new Map(universities.map((uni) => [uni.name, uni]));
  const { programs, duplicateCount } = buildPrograms(rows, uniMap);
  if (duplicateCount > 0) {
    console.log(`Skipped ${duplicateCount} duplicate program rows (by deterministic ID).`);
  }

  await upsertUniversities(universities);
  console.log('Universities upserted.');

  await replacePrograms(programs);
  console.log(`Replaced programs table with ${programs.length} rows.`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
