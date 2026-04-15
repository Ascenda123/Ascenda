import fs from 'fs';
import path from 'path';
// @ts-ignore - papaparse has no bundled types here
import Papa from 'papaparse';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type InputRow = {
  row_id: string;
  country_code: string;
  country_name: string;
  region: string;
  state_code: string;
  city: string;
  campus: string;
  campus_setting: string;
  locale_code: string;
  university_name: string;
  institution_type: string;
  russell_group: string;
  go8_member: string;
  branch_campus: string;
  unitid: string;
  opeid: string;
  course_name: string;
  degree_level: string;
  degree_type: string;
  program_code: string;
  ucas_course_code: string;
  au_course_code: string;
  study_area: string;
  cricos_code: string;
  data_granularity: string;
  duration_years: string;
  duration_years_min: string;
  duration_years_max: string;
  duration_raw: string;
  start_date: string;
  academic_year: string;
  test_policy: string;
  acceptance_rate: string;
  alevel_minimum_offer: string;
  min_ib: string;
  atar_minimum: string;
  atar_typical: string;
  gpa_minimum: string;
  gpa_typical: string;
  gpa_scale: string;
  ca_average_minimum: string;
  ca_average_typical_raw: string;
  sat_reading_25: string;
  sat_reading_75: string;
  sat_math_25: string;
  sat_math_75: string;
  act_composite_25: string;
  act_composite_75: string;
  subject_requirements: string;
  language_of_instruction: string;
  taught_in_english: string;
  english_requirements: string;
  ielts_minimum: string;
  ielts_component_minimum: string;
  toefl_minimum: string;
  tuition_domestic: string;
  tuition_domestic_min: string;
  tuition_domestic_max: string;
  tuition_international: string;
  tuition_international_min: string;
  tuition_international_max: string;
  tuition_instate: string;
  tuition_outofstate: string;
  fee_currency: string;
  fee_period: string;
  tuition_split_available: string;
  tuition_vintage: string;
  application_fee_domestic: string;
  application_fee_intl: string;
  au_fee_type: string;
  au_intl_fee_total: string;
  au_intl_duration_weeks: string;
  deadline_ed: string;
  deadline_edii: string;
  deadline_ea: string;
  deadline_rd: string;
  deadline_rolling: string;
  deadline_day_approximate: string;
  deadline_vintage: string;
  application_portal: string;
  application_portal_url: string;
  application_url: string;
  admissions_url: string;
  qs_world_rank: string;
  the_world_rank: string;
  cwur_world_rank: string;
  qs_subject_rank: string;
  qs_subject_name: string;
  rankings_year: string;
  data_source: string;
  data_vintage: string;
  scrape_timestamp: string;
  country_source_file: string;
  source_url: string;
  university_score: string;
  selectivity_score: string;
  total_course_score: string;
  course_tier: string;
  field_of_study: string;
  sat_average: string;
  ib_sat_equivalent: string;
  sat_reading_average: string;
  sat_math_average: string;
};

type CityOut = {
  id: string;
  name: string;
  region: string | undefined;
  country: string;
};

type UniversityOut = {
  id: string;
  name: string;
  country: string;
  region: string | undefined;
  city: string | undefined;
  city_id: string | undefined;
  rank_overall: number | undefined;
  rank_source: string | undefined;
  qs_uk_rank: number | undefined;
  times_sunday_rank: number | undefined;
  acceptance_rate_pct: number | undefined;
  university_life: string | undefined;
  metadata: Record<string, unknown>;
};

type ProgramOut = {
  id: string;
  university_id: string;
  name: string;
  course_name: string;
  field: string | undefined;
  study_level: string | undefined;
  level: string | undefined;
  duration: string | undefined;
  duration_years: number | undefined;
  start_date: string | undefined;
  campus: string | undefined;
  language: string | undefined;
  mode: string | undefined;
  intake_months: string[] | undefined;
  tuition: number | undefined;
  currency: string | undefined;
  ucas_code: string | undefined;
  subject_requirements: string | undefined;
  english_requirements: string | undefined;
  url: string | undefined;
  provider_apply_url: string | undefined;
  course_online_page: string | undefined;
  admission_test: string | undefined;
  min_ib_score: number | undefined;
  min_a_level_score: string | undefined;
  a_level_min_numeric: number | undefined;
  preferred_subjects: string | undefined;
  english_score_requirement: string | undefined;
  yearly_international_tuition_fee_gbp: number | undefined;
  metadata: Record<string, unknown>;
};

type RequirementOut = {
  program_id: string;
  curriculum: string | undefined;
  min_gpa: number | undefined;
  min_ib_total: number | undefined;
  min_sat: number | undefined;
  min_act: number | undefined;
  required_subjects: string[] | undefined;
  language_tests: Record<string, number> | undefined;
  other_requirements: string | undefined;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const UUID_NAMESPACE = 'ascenda-all-countries-v1';

const trim = (v?: string | null): string | undefined => {
  if (!v) return undefined;
  const t = v.trim();
  return t === '' || t === 'N/A' || t === 'null' || t === 'false' ? undefined : t;
};

const uuidFromString = (value: string): string => {
  const hash = crypto.createHash('sha1').update(UUID_NAMESPACE + value).digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = hash.toString('hex').slice(0, 32);
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20, 32)].join('-');
};

const parseNum = (v?: string): number | undefined => {
  const t = trim(v);
  if (!t) return undefined;
  const n = parseFloat(t.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : undefined;
};

const parseInt2 = (v?: string): number | undefined => {
  const n = parseNum(v);
  return n !== undefined ? Math.round(n) : undefined;
};

// Strip N/A and zero, return integer rank
const parseRank = (v?: string): number | undefined => {
  const t = trim(v);
  if (!t) return undefined;
  const n = parseInt(t.replace(/[^0-9]/g, ''), 10);
  if (!Number.isFinite(n) || n === 0) return undefined;
  return n;
};

// acceptance_rate: may be decimal (0.662) or pct (66.2) — normalise to 0–100
const parseAcceptanceRate = (v?: string): number | undefined => {
  const n = parseNum(v);
  if (n === undefined) return undefined;
  if (n > 1) return Math.min(n, 100); // already a percentage
  return parseFloat((n * 100).toFixed(2));
};

const monthMap: Record<string, string> = {
  '01': 'January', '02': 'February', '03': 'March', '04': 'April',
  '05': 'May', '06': 'June', '07': 'July', '08': 'August',
  '09': 'September', '10': 'October', '11': 'November', '12': 'December',
};

const extractMonth = (v?: string): string | undefined => {
  const t = trim(v);
  if (!t) return undefined;
  const iso = t.match(/^(\d{4})-(\d{2})/);
  if (iso) return monthMap[iso[2]];
  const slash = t.split('/');
  if (slash.length >= 2) return monthMap[slash[1].padStart(2, '0')];
  return Object.values(monthMap).find(m => t.toLowerCase().includes(m.toLowerCase()));
};

// A-level grade normalisation
const A_LEVEL_MAP: Record<string, number> = {
  'A*A*A*': 100, 'A*A*A': 100, 'A*AA': 95, 'A*AB': 90,
  'AAA': 88, 'AAB': 80, 'ABB': 72, 'BBB': 60,
  'BBC': 50, 'BCC': 40, 'CCC': 30,
};

const normaliseALevel = (v?: string): string | undefined => {
  const t = trim(v);
  if (!t) return undefined;
  const upper = t.toUpperCase();
  const match = upper.match(/A\*A\*A\*|A\*A\*A|A\*AA|A\*AB|AAA|AAB|ABB|BBB|BBC|BCC|CCC/);
  return match ? match[0] : t.slice(0, 20); // keep raw if no pattern
};

const aLevelNumeric = (v?: string): number | undefined => {
  const norm = normaliseALevel(v);
  if (!norm) return undefined;
  return A_LEVEL_MAP[norm];
};

// IB score: must be integer 24–45
const parseIb = (v?: string): number | undefined => {
  const n = parseNum(v);
  if (n === undefined) return undefined;
  const r = Math.round(n);
  return r >= 24 && r <= 45 ? r : undefined;
};

// Tuition: convert non-GBP to approximate GBP using rough rates
// Rates are approximate — the data already has the currency tagged
const FX: Record<string, number> = { GBP: 1, USD: 0.79, CAD: 0.58, AUD: 0.51 };

const toGbp = (amount: number, currency: string): number => {
  const rate = FX[currency.toUpperCase()] ?? 1;
  return Math.round(amount * rate);
};

// Split subject requirements string into array
const splitSubjects = (v?: string): string[] | undefined => {
  const t = trim(v);
  if (!t) return undefined;
  const parts = t.split(/[;,|]+/).map(s => s.trim()).filter(Boolean);
  return parts.length > 0 ? parts : undefined;
};

// Build SAT composite from reading + math 25th percentile
const satMin = (r25?: string, m25?: string): number | undefined => {
  const r = parseNum(r25);
  const m = parseNum(m25);
  if (r !== undefined && m !== undefined) return Math.round(r + m);
  return undefined;
};

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

const buildCities = (rows: InputRow[]): Map<string, CityOut> => {
  const map = new Map<string, CityOut>();
  for (const row of rows) {
    const cityName = trim(row.city);
    if (!cityName) continue;
    const country = trim(row.country_name) ?? 'Unknown';
    const region = trim(row.region) ?? trim(row.state_code);
    const key = `${cityName}||${country}`;
    if (!map.has(key)) {
      map.set(key, {
        id: uuidFromString(`city:${key}`),
        name: cityName,
        region,
        country,
      });
    }
  }
  return map;
};

const buildUniversities = (
  rows: InputRow[],
  cityMap: Map<string, CityOut>
): Map<string, UniversityOut> => {
  const map = new Map<string, UniversityOut>();
  for (const row of rows) {
    const name = row.university_name.trim();
    if (map.has(name)) continue;

    const country = trim(row.country_name) ?? 'Unknown';
    const region = trim(row.region) ?? trim(row.state_code);
    const cityName = trim(row.city);
    const cityKey = cityName ? `${cityName}||${country}` : undefined;
    const cityRecord = cityKey ? cityMap.get(cityKey) : undefined;

    const metadata: Record<string, unknown> = { source: 'all_countries_programs' };
    if (trim(row.institution_type)) metadata.institution_type = row.institution_type.trim();
    if (row.russell_group === 'true') metadata.russell_group = true;
    if (row.go8_member === 'true') metadata.go8_member = true;
    if (trim(row.cwur_world_rank)) metadata.cwur_world_rank = parseRank(row.cwur_world_rank);
    if (trim(row.university_score)) metadata.university_score = parseNum(row.university_score);
    if (trim(row.rankings_year)) metadata.rankings_year = row.rankings_year.trim();

    map.set(name, {
      id: uuidFromString(`uni:${name}`),
      name,
      country,
      region,
      city: cityName,
      city_id: cityRecord?.id,
      rank_overall: parseRank(row.qs_world_rank),
      rank_source: parseRank(row.qs_world_rank) ? 'QS World' : undefined,
      qs_uk_rank: undefined, // not in this dataset at uni level
      times_sunday_rank: parseRank(row.the_world_rank),
      acceptance_rate_pct: parseAcceptanceRate(row.acceptance_rate),
      university_life: trim(row.campus_setting),
      metadata,
    });
  }
  return map;
};

const buildPrograms = (
  rows: InputRow[],
  uniMap: Map<string, UniversityOut>
): { programs: ProgramOut[]; requirements: RequirementOut[] } => {
  const programMap = new Map<string, ProgramOut>();
  const requirementMap = new Map<string, RequirementOut>();
  let skipped = 0;

  for (const row of rows) {
    const uni = uniMap.get(row.university_name.trim());
    if (!uni) { skipped++; continue; }

    // UUID key includes campus + duration to preserve legitimate duplicates
    const programId = uuidFromString(
      `program:${uni.id}:${row.course_name.trim()}:${trim(row.campus) ?? ''}:${trim(row.duration_raw) ?? ''}`
    );

    if (programMap.has(programId)) continue;

    const currency = trim(row.fee_currency) ?? 'GBP';
    const intlTuition = parseNum(row.tuition_international);
    const intlTuitionGbp = intlTuition !== undefined ? toGbp(intlTuition, currency) : undefined;
    const domesticTuition = parseNum(row.tuition_domestic);

    const month = extractMonth(row.start_date);
    const minIb = parseIb(row.min_ib);
    const minALevel = normaliseALevel(row.alevel_minimum_offer);
    const aLevelNum = aLevelNumeric(row.alevel_minimum_offer);

    const ielts = parseNum(row.ielts_minimum);
    const toefl = parseNum(row.toefl_minimum);
    const languageTests: Record<string, number> = {};
    if (ielts !== undefined) languageTests.ielts = ielts;
    if (toefl !== undefined) languageTests.toefl = toefl;

    const metadata: Record<string, unknown> = { source: 'all_countries_programs' };
    if (trim(row.application_portal)) metadata.application_portal = row.application_portal.trim();
    if (trim(row.course_tier)) metadata.course_tier = parseInt2(row.course_tier);
    if (trim(row.selectivity_score)) metadata.selectivity_score = parseNum(row.selectivity_score);
    if (trim(row.total_course_score)) metadata.total_course_score = parseNum(row.total_course_score);
    if (trim(row.program_code)) metadata.program_code = row.program_code.trim();
    if (trim(row.au_course_code)) metadata.au_course_code = row.au_course_code.trim();
    if (trim(row.cricos_code)) metadata.cricos_code = row.cricos_code.trim();
    if (trim(row.toefl_minimum)) metadata.toefl_minimum = toefl;
    if (trim(row.data_source)) metadata.data_source = row.data_source.trim();
    if (trim(row.data_vintage)) metadata.data_vintage = row.data_vintage.trim();
    if (trim(row.atar_minimum)) metadata.atar_minimum = parseNum(row.atar_minimum);
    if (trim(row.atar_typical)) metadata.atar_typical = parseNum(row.atar_typical);
    if (trim(row.sat_average)) metadata.sat_average = parseNum(row.sat_average);
    if (trim(row.ib_sat_equivalent)) metadata.ib_sat_equivalent = parseNum(row.ib_sat_equivalent);
    if (trim(row.deadline_ed)) metadata.deadline_ed = row.deadline_ed.trim();
    if (trim(row.deadline_edii)) metadata.deadline_edii = row.deadline_edii.trim();
    if (trim(row.deadline_ea)) metadata.deadline_ea = row.deadline_ea.trim();
    if (trim(row.deadline_rd)) metadata.deadline_rd = row.deadline_rd.trim();
    if (row.deadline_rolling === 'true') metadata.deadline_rolling = true;

    // mode: infer from campus text
    const campusText = trim(row.campus)?.toLowerCase() ?? '';
    const mode = campusText.includes('online') ? 'Online' : 'On-campus';

    programMap.set(programId, {
      id: programId,
      university_id: uni.id,
      name: trim(row.degree_type) ?? row.course_name.trim(),
      course_name: row.course_name.trim(),
      field: trim(row.field_of_study) ?? trim(row.study_area),
      study_level: trim(row.degree_level),
      level: trim(row.degree_level),
      duration: trim(row.duration_raw),
      duration_years: parseNum(row.duration_years),
      start_date: trim(row.start_date),
      campus: trim(row.campus),
      language: trim(row.language_of_instruction) ?? 'English',
      mode,
      intake_months: month ? [month] : undefined,
      tuition: domesticTuition,
      currency,
      ucas_code: trim(row.ucas_course_code),
      subject_requirements: trim(row.subject_requirements),
      english_requirements: trim(row.english_requirements),
      url: trim(row.application_url),
      provider_apply_url: trim(row.admissions_url),
      course_online_page: trim(row.application_url),
      admission_test: trim(row.test_policy),
      min_ib_score: minIb,
      min_a_level_score: minALevel,
      a_level_min_numeric: aLevelNum,
      preferred_subjects: trim(row.subject_requirements),
      english_score_requirement: ielts !== undefined ? `IELTS ${ielts}` : undefined,
      yearly_international_tuition_fee_gbp: intlTuitionGbp,
      metadata,
    });

    // SAT composite from 25th percentile reading + math
    const minSat = satMin(row.sat_reading_25, row.sat_math_25);
    const minAct = parseNum(row.act_composite_25) !== undefined ? Math.round(parseNum(row.act_composite_25)!) : undefined;
    const minGpa = parseNum(row.gpa_minimum) ?? parseNum(row.gpa_typical);

    requirementMap.set(programId, {
      program_id: programId,
      curriculum: undefined,
      min_gpa: minGpa,
      min_ib_total: minIb,
      min_sat: minSat,
      min_act: minAct,
      required_subjects: splitSubjects(row.subject_requirements),
      language_tests: Object.keys(languageTests).length > 0 ? languageTests : undefined,
      other_requirements: undefined,
    });
  }

  if (skipped > 0) console.warn(`Skipped ${skipped} rows: university not found in map`);
  return { programs: Array.from(programMap.values()), requirements: Array.from(requirementMap.values()) };
};

// ---------------------------------------------------------------------------
// CSV writer
// ---------------------------------------------------------------------------

const writeCsv = (filePath: string, data: Record<string, unknown>[], columns: string[]) => {
  const serialized = data.map(row => {
    const obj: Record<string, unknown> = {};
    for (const col of columns) {
      const value = row[col];
      if (value === undefined || value === null || value === '') {
        obj[col] = '';
      } else if (Array.isArray(value) || (typeof value === 'object')) {
        obj[col] = JSON.stringify(value);
      } else {
        obj[col] = value;
      }
    }
    return obj;
  });
  const csv = Papa.unparse(serialized, { columns });
  fs.writeFileSync(filePath, csv, 'utf-8');
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const main = () => {
  const getArg = (flag: string, fallback?: string): string | undefined => {
    const i = process.argv.indexOf(flag);
    return i !== -1 ? process.argv[i + 1] : fallback;
  };

  const inputPath = getArg('--input');
  if (!inputPath) {
    console.error('Usage: npx ts-node scripts/all-countries-to-supabase.ts --input <path/to/csv> [--out <output-dir>]');
    process.exit(1);
  }
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const outDir = getArg('--out', 'supabase/imports') as string;
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`Reading ${inputPath}...`);
  const contents = fs.readFileSync(inputPath, 'utf-8');
  const parsed = Papa.parse(contents, { header: true, skipEmptyLines: true });
  if (parsed.errors.length) {
    const msg = parsed.errors.slice(0, 5).map((e: any) => `${e.message} at row ${e.row}`).join('; ');
    console.error(`CSV parse errors: ${msg}`);
    process.exit(1);
  }

  const rows: InputRow[] = (parsed.data as InputRow[]).filter(
    r => r.university_name?.trim() && r.course_name?.trim()
  );
  console.log(`Loaded ${rows.length} valid rows (${(parsed.data as any[]).length - rows.length} skipped — missing university or course name)`);

  const cityMap = buildCities(rows);
  const uniMap = buildUniversities(rows, cityMap);
  const { programs, requirements } = buildPrograms(rows, uniMap);

  // Write cities
  writeCsv(path.join(outDir, 'cities.csv'), Array.from(cityMap.values()) as any, [
    'id', 'name', 'region', 'country',
  ]);

  // Write universities
  writeCsv(path.join(outDir, 'universities.csv'), Array.from(uniMap.values()) as any, [
    'id', 'name', 'country', 'region', 'city', 'city_id',
    'rank_overall', 'rank_source', 'qs_uk_rank', 'times_sunday_rank',
    'acceptance_rate_pct', 'university_life', 'metadata',
  ]);

  // Write programs
  writeCsv(path.join(outDir, 'programs.csv'), programs as any, [
    'id', 'university_id', 'name', 'course_name', 'field',
    'study_level', 'level', 'duration', 'duration_years',
    'start_date', 'campus', 'language', 'mode', 'intake_months',
    'tuition', 'currency', 'ucas_code', 'subject_requirements',
    'english_requirements', 'url', 'provider_apply_url', 'course_online_page',
    'admission_test', 'min_ib_score', 'min_a_level_score', 'a_level_min_numeric',
    'preferred_subjects', 'english_score_requirement',
    'yearly_international_tuition_fee_gbp', 'metadata',
  ]);

  // Write requirements
  writeCsv(path.join(outDir, 'program_requirements.csv'), requirements as any, [
    'program_id', 'curriculum', 'min_gpa', 'min_ib_total',
    'min_sat', 'min_act', 'required_subjects', 'language_tests', 'other_requirements',
  ]);

  console.log('\n--- Transform complete ---');
  console.log(`Cities:       ${cityMap.size}`);
  console.log(`Universities: ${uniMap.size}`);
  console.log(`Programs:     ${programs.length}`);
  console.log(`Requirements: ${requirements.length}`);
  console.log(`Output dir:   ${outDir}`);
};

main();
