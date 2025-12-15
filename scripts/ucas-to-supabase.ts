import fs from 'fs';
import path from 'path';
// @ts-ignore - papaparse has no bundled types here
import Papa from 'papaparse';
import crypto from 'crypto';

type InputRow = {
  university: string;
  course_name: string;
  ucas_code?: string;
  study_level?: string;
  duration?: string;
  duration_years?: string;
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
  additional_entry_requirements?: string;
  subsequent_year_entry_requirements?: string;
  english_requirements?: string;
  contextual_admissions?: string;
  additional_fee_info?: string;
  student_satisfaction?: string;
  employment_after_course?: string;
  student_outcomes?: string;
  average_salary_after_15m?: string;
  open_days?: string;
  tuition_fees_international?: string;
  tuition_fees_home?: string;
};

type UniversityOut = {
  id: string;
  name: string;
  country: string;
  region?: string;
  city?: string;
  rank_overall?: number;
  rank_source?: string;
  website?: string;
  intl_tuition_low?: number;
  intl_tuition_high?: number;
  currency?: string;
  acceptance_rate?: number;
  requires_test?: boolean;
  metadata?: Record<string, unknown>;
};

type ProgramOut = {
  id: string;
  university_id: string;
  name: string;
  course_name: string;
  field?: string;
  study_level?: string;
  level?: string;
  duration?: string;
  duration_years?: number;
  start_date?: string;
  campus?: string;
  language?: string;
  mode?: string;
  intake_months?: string[];
  tuition?: number;
  currency?: string;
  course_summary?: string;
  modules?: string;
  assessment_methods?: string;
  provider_course_url?: string;
  provider_apply_url?: string;
  ucas_code?: string;
  min_alevel?: string;
  min_ib?: string;
  ucas_points?: string;
  subject_requirements?: string;
  additional_entry_requirements?: string;
  subsequent_year_entry_requirements?: string;
  english_requirements?: string;
  contextual_admissions?: string;
  additional_fee_info?: string;
  student_satisfaction?: string;
  employment_after_course?: string;
  student_outcomes?: string;
  average_salary_after_15m?: string;
  open_days?: string;
  url?: string;
  metadata?: Record<string, unknown>;
};

type RequirementOut = {
  program_id: string;
  curriculum?: string;
  min_gpa?: number;
  min_ib_total?: number;
  min_sat?: number;
  min_act?: number;
  required_subjects?: string[];
  language_tests?: Record<string, number>;
  other_requirements?: string;
};

const DEFAULT_COUNTRY = 'United Kingdom';
const UUID_NAMESPACE = 'ascenda-ucas-namespace';

const monthMap = new Map<string, string>([
  ['01', 'January'],
  ['02', 'February'],
  ['03', 'March'],
  ['04', 'April'],
  ['05', 'May'],
  ['06', 'June'],
  ['07', 'July'],
  ['08', 'August'],
  ['09', 'September'],
  ['10', 'October'],
  ['11', 'November'],
  ['12', 'December']
]);

const trimOrUndefined = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

const parseMoney = (value?: string): number | undefined => {
  const cleaned = trimOrUndefined(value);
  if (!cleaned) return undefined;
  const numeric = cleaned.replace(/[^0-9.]/g, '').replace(/\\.\\./g, '.');
  if (!numeric) return undefined;
  const parsed = parseFloat(numeric.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseDurationYears = (value?: string): number | undefined => {
  const text = trimOrUndefined(value);
  if (!text) return undefined;
  const match = text.match(/([0-9]+(?:\\.[0-9]+)?)/);
  return match ? parseFloat(match[1]) : undefined;
};

const extractMonth = (value?: string): string | undefined => {
  const text = trimOrUndefined(value);
  if (!text) return undefined;
  // Supports dd/mm/yyyy or named months.
  const slashParts = text.split('/');
  if (slashParts.length >= 2) {
    const monthPart = slashParts[1].padStart(2, '0');
    return monthMap.get(monthPart);
  }
  const isoMatch = text.match(/^\\d{4}-(\\d{2})/);
  if (isoMatch) {
    return monthMap.get(isoMatch[1]);
  }
  const monthName = Array.from(monthMap.values()).find((month) =>
    text.toLowerCase().includes(month.toLowerCase())
  );
  return monthName;
};

const extractNumber = (value?: string): number | undefined => {
  const text = trimOrUndefined(value);
  if (!text) return undefined;
  const match = text.match(/([0-9]+(?:\\.[0-9]+)?)/);
  return match ? parseFloat(match[1]) : undefined;
};

const extractIelts = (value?: string): number | undefined => {
  const text = trimOrUndefined(value);
  if (!text) return undefined;
  const match = text.match(/ielts[^0-9]*([0-9]+(?:\\.[0-9]+)?)/i);
  return match ? parseFloat(match[1]) : undefined;
};

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

const readInput = (inputPath: string): InputRow[] => {
  const contents = fs.readFileSync(inputPath, 'utf-8');
  const parsed = Papa.parse(contents, {
    header: true,
    skipEmptyLines: true
  });
  if (parsed.errors.length) {
    const message = parsed.errors.map((e: any) => `${e.message} at row ${e.row}`).join('; ');
    throw new Error(`CSV parse errors: ${message}`);
  }
  return parsed.data
    .map((row: InputRow) => {
      if (!row || !row.university || !row.course_name) return null;
      return {
        university: row.university,
        course_name: row.course_name,
        ucas_code: trimOrUndefined(row.ucas_code),
        study_level: trimOrUndefined(row.study_level),
        duration: trimOrUndefined(row.duration),
        duration_years: trimOrUndefined(row.duration_years),
        start_date: trimOrUndefined(row.start_date),
        campus: trimOrUndefined(row.campus),
        course_summary: trimOrUndefined(row.course_summary),
        modules: trimOrUndefined(row.modules),
        assessment_methods: trimOrUndefined(row.assessment_methods),
        provider_course_url: trimOrUndefined(row.provider_course_url),
        provider_apply_url: trimOrUndefined(row.provider_apply_url),
        min_alevel: trimOrUndefined(row.min_alevel),
        min_ib: trimOrUndefined(row.min_ib),
        ucas_points: trimOrUndefined(row.ucas_points),
        subject_requirements: trimOrUndefined(row.subject_requirements),
        additional_entry_requirements: trimOrUndefined(row.additional_entry_requirements),
        subsequent_year_entry_requirements: trimOrUndefined(row.subsequent_year_entry_requirements),
        english_requirements: trimOrUndefined(row.english_requirements),
        contextual_admissions: trimOrUndefined(row.contextual_admissions),
        additional_fee_info: trimOrUndefined(row.additional_fee_info),
        student_satisfaction: trimOrUndefined(row.student_satisfaction),
        employment_after_course: trimOrUndefined(row.employment_after_course),
        student_outcomes: trimOrUndefined(row.student_outcomes),
        average_salary_after_15m: trimOrUndefined(row.average_salary_after_15m),
        open_days: trimOrUndefined(row.open_days),
        tuition_fees_international: trimOrUndefined(row.tuition_fees_international),
        tuition_fees_home: trimOrUndefined(row.tuition_fees_home)
      };
    })
    .filter((row: InputRow | null): row is InputRow => !!row);
};

const buildUniversities = (rows: InputRow[]): Map<string, UniversityOut> => {
  const map = new Map<string, UniversityOut>();
  rows.forEach((row: InputRow) => {
    const name = row.university.trim();
    if (map.has(name)) return;
    const id = uuidFromString(`uni:${name}`);
    const metadata: Record<string, unknown> = { source: 'ucas' };
    map.set(name, {
      id,
      name,
      country: DEFAULT_COUNTRY,
      metadata
    });
  });
  return map;
};

const buildPrograms = (
  rows: InputRow[],
  uniMap: Map<string, UniversityOut>
): { programs: ProgramOut[]; requirements: RequirementOut[] } => {
  const programMap = new Map<string, ProgramOut>();
  const requirementMap = new Map<string, RequirementOut>();

  rows.forEach((row: InputRow) => {
    const uni = uniMap.get(row.university.trim());
    if (!uni) return;

    const programId = uuidFromString(`program:${uni.id}:${row.course_name}:${row.ucas_code || ''}`);
    if (programMap.has(programId)) {
      return;
    }

    const durationYears =
      parseDurationYears(row.duration_years) ?? parseDurationYears(row.duration);
    const intake = extractMonth(row.start_date);
    const tuition =
      parseMoney(row.tuition_fees_international) ?? parseMoney(row.tuition_fees_home);
    const ielts = extractIelts(row.english_requirements);

    const programMeta: Record<string, unknown> = {
      source: 'ucas'
    };

    programMap.set(programId, {
      id: programId,
      university_id: uni.id,
      name: row.course_name.trim(),
      course_name: row.course_name.trim(),
      field: undefined,
      study_level: row.study_level,
      level: row.study_level,
      duration: row.duration,
      duration_years: durationYears,
      start_date: row.start_date,
      campus: row.campus,
      language: 'English',
      mode: row.campus?.toLowerCase().includes('online') ? 'Online' : 'On-campus',
      intake_months: intake ? [intake] : undefined,
      tuition: tuition,
      currency: tuition ? 'GBP' : undefined,
      course_summary: row.course_summary,
      modules: row.modules,
      assessment_methods: row.assessment_methods,
      provider_course_url: row.provider_course_url,
      provider_apply_url: row.provider_apply_url,
      ucas_code: row.ucas_code,
      min_alevel: row.min_alevel,
      min_ib: row.min_ib,
      ucas_points: row.ucas_points,
      subject_requirements: row.subject_requirements,
      additional_entry_requirements: row.additional_entry_requirements,
      subsequent_year_entry_requirements: row.subsequent_year_entry_requirements,
      english_requirements: row.english_requirements,
      contextual_admissions: row.contextual_admissions,
      additional_fee_info: row.additional_fee_info,
      student_satisfaction: row.student_satisfaction,
      employment_after_course: row.employment_after_course,
      student_outcomes: row.student_outcomes,
      average_salary_after_15m: row.average_salary_after_15m,
      open_days: row.open_days,
      url: row.provider_course_url,
      metadata: Object.keys(programMeta).length ? programMeta : undefined
    });

    const reqPieces: string[] = [];
    if (row.min_alevel) reqPieces.push(`A-level: ${row.min_alevel}`);
    if (row.min_ib) reqPieces.push(`IB: ${row.min_ib}`);
    if (row.ucas_points) reqPieces.push(`UCAS points: ${row.ucas_points}`);
    if (row.subject_requirements) reqPieces.push(`Subjects: ${row.subject_requirements}`);
    if (row.additional_entry_requirements) reqPieces.push(`Additional: ${row.additional_entry_requirements}`);
    if (row.english_requirements) reqPieces.push(`English: ${row.english_requirements}`);
    if (row.contextual_admissions) reqPieces.push(`Contextual: ${row.contextual_admissions}`);

    const minIbTotal = extractNumber(row.min_ib);

    const languageTests =
      typeof ielts === 'number'
        ? {
          ielts
        }
        : undefined;

    requirementMap.set(programId, {
      program_id: programId,
      curriculum: undefined,
      min_gpa: undefined,
      min_ib_total: minIbTotal,
      min_sat: undefined,
      min_act: undefined,
      required_subjects: undefined,
      language_tests: languageTests,
      other_requirements: reqPieces.length ? reqPieces.join(' | ') : undefined
    });
  });

  return { programs: Array.from(programMap.values()), requirements: Array.from(requirementMap.values()) };
};

const writeCsv = (filename: string, data: any[], columns: string[]) => {
  const serialized = data.map((row: Record<string, unknown>) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col) => {
      const value = (row as any)[col];
      if (value === undefined || value === null || value === '') {
        obj[col] = '';
      } else if (Array.isArray(value) || typeof value === 'object') {
        obj[col] = JSON.stringify(value);
      } else {
        obj[col] = value;
      }
    });
    return obj;
  });
  const csv = Papa.unparse(serialized, { columns });
  fs.writeFileSync(filename, csv);
};

const main = () => {
  const getArg = (flag: string, fallback?: string): string | undefined => {
    const index = process.argv.indexOf(flag);
    if (index === -1) return fallback;
    return process.argv[index + 1];
  };

  const inputPath = getArg('--input', '/Users/gregfranck/UCAS Data Scraper/Updated Course List.cleaned.csv') as string;
  const outDir = getArg('--out', 'supabase/imports') as string;

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });

  const rows = readInput(inputPath);
  const uniMap = buildUniversities(rows);
  const { programs, requirements } = buildPrograms(rows, uniMap);

  const universitiesPath = path.join(outDir, 'universities.csv');
  const programsPath = path.join(outDir, 'programs.csv');
  const requirementsPath = path.join(outDir, 'program_requirements.csv');

  writeCsv(
    universitiesPath,
    Array.from(uniMap.values()),
    [
      'id',
      'name',
      'country',
      'region',
      'city',
      'rank_overall',
      'rank_source',
      'website',
      'intl_tuition_low',
      'intl_tuition_high',
      'currency',
      'acceptance_rate',
      'requires_test',
      'metadata'
    ]
  );

  writeCsv(
    programsPath,
    programs,
    [
      'id',
      'university_id',
      'name',
      'course_name',
      'field',
      'study_level',
      'level',
      'duration',
      'duration_years',
      'start_date',
      'campus',
      'language',
      'mode',
      'intake_months',
      'tuition',
      'currency',
      'course_summary',
      'modules',
      'assessment_methods',
      'provider_course_url',
      'provider_apply_url',
      'ucas_code',
      'min_alevel',
      'min_ib',
      'ucas_points',
      'subject_requirements',
      'additional_entry_requirements',
      'subsequent_year_entry_requirements',
      'english_requirements',
      'contextual_admissions',
      'additional_fee_info',
      'student_satisfaction',
      'employment_after_course',
      'student_outcomes',
      'average_salary_after_15m',
      'open_days',
      'url',
      'metadata'
    ]
  );

  writeCsv(
    requirementsPath,
    requirements,
    [
      'program_id',
      'curriculum',
      'min_gpa',
      'min_ib_total',
      'min_sat',
      'min_act',
      'required_subjects',
      'language_tests',
      'other_requirements'
    ]
  );

  console.log(`Wrote ${uniMap.size} universities, ${programs.length} programs, ${requirements.length} requirements to ${outDir}`);
};

main();
