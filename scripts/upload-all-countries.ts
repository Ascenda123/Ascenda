import fs from 'fs';
import path from 'path';
// @ts-ignore - papaparse has no bundled types here
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';

type Row = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const uniqueByKey = (rows: Row[], key: string): Row[] => {
  const map = new Map<string, Row>();
  for (const row of rows) {
    const v = row[key];
    if (typeof v === 'string' && !map.has(v)) map.set(v, row);
  }
  return Array.from(map.values());
};

const readCsv = (filePath: string): Row[] => {
  const contents = fs.readFileSync(filePath, 'utf-8');
  const parsed = Papa.parse(contents, { header: true, skipEmptyLines: true });
  if (parsed.errors.length) {
    const msg = parsed.errors.slice(0, 5).map((e: any) => `${e.message} at row ${e.row}`).join('; ');
    throw new Error(`CSV parse errors in ${filePath}: ${msg}`);
  }

  const numericFields = new Set([
    'rank_overall', 'qs_uk_rank', 'times_sunday_rank',
    'acceptance_rate_pct', 'nss_score_pct', 'international_students_ratio_pct',
    'student_to_staff_ratio', 'graduate_employment_rate_pct',
    'average_starting_salary_gbp', 'number_of_students',
    'student_dorm_cost_gbp_per_year', 'average_rent_outside_campus_gbp_per_month_override',
    'duration_years', 'tuition', 'min_ib_score', 'a_level_min_numeric',
    'yearly_international_tuition_fee_gbp', 'intake_size', 'gender_ratio_pct',
    'min_gpa', 'min_ib_total', 'min_sat', 'min_act',
    'average_rent_outside_campus_gbp_per_month',
  ]);

  return (parsed.data as Row[]).map((row: Row) => {
    const out: Row = {};
    for (const [key, value] of Object.entries(row)) {
      if (value === undefined || value === null || value === '') continue;
      if (typeof value === 'string') {
        const t = value.trim();
        if (t === '') continue;
        // Parse JSON objects/arrays
        if (t.length > 1 && ((t[0] === '{' && t[t.length - 1] === '}') || (t[0] === '[' && t[t.length - 1] === ']'))) {
          try { out[key] = JSON.parse(t); continue; } catch { /* keep as string */ }
        }
        // Parse numerics
        if (numericFields.has(key)) {
          const cleaned = t.replace(/[^0-9.-]/g, '');
          if (cleaned) {
            const n = Number(cleaned);
            if (Number.isFinite(n)) { out[key] = n; continue; }
          }
        }
        out[key] = t;
      } else {
        out[key] = value;
      }
    }
    return out;
  }).filter((row: Row) => Object.keys(row).length > 0);
};

const getClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    throw new Error(
      'Missing env vars. Need NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env.local'
    );
  }
  return createClient(supabaseUrl, serviceRole);
};

const deleteRowsInBatches = async (table: string, key: string, batchSize = 500) => {
  const supabase = getClient();
  console.log(`  Deleting all rows from ${table} in batches...`);

  while (true) {
    const { data, error: selectError } = await supabase
      .from(table)
      .select(key)
      .order(key, { ascending: true })
      .limit(batchSize);

    if (selectError) {
      throw new Error(`Select failed on ${table}: ${selectError.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    const keys = data.map((row: any) => row[key]);
    const { error } = await supabase.from(table).delete().in(key, keys);
    if (error) {
      throw new Error(`Delete failed on ${table}: ${error.message}`);
    }

    if (data.length < batchSize) {
      break;
    }
  }
};

const deleteAll = async (table: string) => deleteRowsInBatches(table, 'id');

const deleteAllByPk = async (table: string, pkColumn: string) => deleteRowsInBatches(table, pkColumn);

const upsertTable = async (table: string, rows: Row[], onConflict: string) => {
  if (!rows.length) { console.log(`  No rows to upsert into ${table}, skipping.`); return; }
  const supabase = getClient();
  let upserted = 0;
  for (const batch of chunk(rows, 500)) {
    const { error } = await supabase.from(table).upsert(batch, { onConflict });
    if (error) throw new Error(`Upsert failed on ${table}: ${error.message}`);
    upserted += batch.length;
    process.stdout.write(`\r  ${table}: ${upserted}/${rows.length}`);
  }
  console.log(`\r  ${table}: ${upserted} rows upserted ✓`);
};

const countTable = async (table: string): Promise<number> => {
  const supabase = getClient();
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (error) throw new Error(`Count failed on ${table}: ${error.message}`);
  return count ?? 0;
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const main = async () => {
  const getArg = (flag: string, fallback?: string): string | undefined => {
    const i = process.argv.indexOf(flag);
    return i !== -1 ? process.argv[i + 1] : fallback;
  };

  const dir = getArg('--dir', 'supabase/imports') as string;

  // Load CSVs
  const citiesPath = path.join(dir, 'cities.csv');
  const universitiesPath = path.join(dir, 'universities.csv');
  const programsPath = path.join(dir, 'programs.csv');
  const requirementsPath = path.join(dir, 'program_requirements.csv');

  for (const p of [universitiesPath, programsPath, requirementsPath]) {
    if (!fs.existsSync(p)) {
      console.error(`Required file not found: ${p}`);
      process.exit(1);
    }
  }

  const hasCities = fs.existsSync(citiesPath);

  console.log('Loading CSVs...');
  const cities    = hasCities ? uniqueByKey(readCsv(citiesPath), 'id') : [];
  const universities = uniqueByKey(readCsv(universitiesPath).map(r => { delete (r as any).course_name; return r; }), 'id');
  const programs  = uniqueByKey(readCsv(programsPath), 'id');
  const requirements = uniqueByKey(readCsv(requirementsPath), 'program_id');

  console.log(`Ready to upload:`);
  console.log(`  Cities:       ${cities.length}`);
  console.log(`  Universities: ${universities.length}`);
  console.log(`  Programs:     ${programs.length}`);
  console.log(`  Requirements: ${requirements.length}`);
  console.log('');

  // ── Step 1: Delete in FK-safe order ─────────────────────────────────────
  console.log('--- Deleting existing data (FK-safe order) ---');
  await deleteAllByPk('program_requirements', 'program_id');
  await deleteAll('deadlines');
  await deleteAll('programs');
  await deleteAll('universities');
  if (hasCities) await deleteAll('cities');
  console.log('Delete complete.\n');

  // ── Step 2: Upsert in reverse FK order ──────────────────────────────────
  console.log('--- Upserting new data ---');
  if (hasCities) await upsertTable('cities', cities, 'id');
  await upsertTable('universities', universities, 'id');
  await upsertTable('programs', programs, 'id');
  await upsertTable('program_requirements', requirements, 'program_id');
  console.log('Upsert complete.\n');

  // ── Step 3: Confirm row counts from Supabase ────────────────────────────
  console.log('--- Confirming row counts in Supabase ---');
  if (hasCities) console.log(`  cities:               ${await countTable('cities')}`);
  console.log(`  universities:         ${await countTable('universities')}`);
  console.log(`  programs:             ${await countTable('programs')}`);
  console.log(`  program_requirements: ${await countTable('program_requirements')}`);
  console.log('\nImport complete ✓');
};

main().catch(err => {
  console.error('\nFATAL:', err.message);
  process.exit(1);
});
