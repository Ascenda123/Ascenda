import fs from 'fs';
import path from 'path';
// @ts-ignore - papaparse has no bundled types here
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';

type CsvRow = {
  id: string;
  min_alevel?: string;
  min_ib?: string;
  additional_entry_requirements?: string;
};

type ProgramUpdate = {
  id: string;
  min_alevel: string | null;
  min_ib: string | null;
  additional_entry_requirements: string | null;
};

const BATCH_SIZE = 100;

const trimOrNull = (value?: string | null) => {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

const chunk = <T,>(items: T[], size: number): T[][] => {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
};

const readCsv = (filePath: string): CsvRow[] => {
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
      const id = trimOrNull(row.id);
      if (!id) return null;
      return {
        id,
        min_alevel: row.min_alevel,
        min_ib: row.min_ib,
        additional_entry_requirements: row.additional_entry_requirements
      };
    })
    .filter((row: CsvRow | null): row is CsvRow => row !== null);
};

const loadLocalEnv = () => {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const contents = fs.readFileSync(envPath, 'utf-8');
  contents.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...rest] = trimmed.split('=');
    if (!key || rest.length === 0) return;
    if (process.env[key]) return;
    process.env[key] = rest.join('=').replace(/^"|"$/g, '');
  });
};

const buildUpdates = (rows: CsvRow[]): ProgramUpdate[] =>
  rows.map((row) => ({
    id: row.id,
    min_alevel: trimOrNull(row.min_alevel),
    min_ib: trimOrNull(row.min_ib),
    additional_entry_requirements: trimOrNull(row.additional_entry_requirements)
  }));

const main = async () => {
  loadLocalEnv();
  const inputFlagIndex = process.argv.indexOf('--input');
  const inputPath =
    inputFlagIndex !== -1
      ? process.argv[inputFlagIndex + 1]
      : 'supabase/imports/programs.csv';

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    throw new Error('SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required.');
  }
  console.log(`Using Supabase URL: ${supabaseUrl}`);
  console.log(`Service role key present: ${Boolean(serviceRole)}`);

  const rows = readCsv(inputPath);
  const updates = buildUpdates(rows);
  console.log(`Prepared ${updates.length} program updates from ${inputPath}.`);

  const supabase = createClient(supabaseUrl, serviceRole);
  let updatedCount = 0;
  let skippedCount = 0;
  for (const batch of chunk(updates, BATCH_SIZE)) {
    for (const row of batch) {
      const { data, error } = await supabase
        .from('programs')
        .update({
          min_alevel: row.min_alevel,
          min_ib: row.min_ib,
          additional_entry_requirements: row.additional_entry_requirements
        })
        .eq('id', row.id)
        .select('id');
      if (error) {
        console.error('Programs update failed for id', row.id, error);
        throw new Error(`Programs update failed: ${error.message ?? 'unknown'}`);
      }
      if (!data || data.length === 0) {
        skippedCount += 1;
        continue;
      }
      updatedCount += 1;
    }
  }
  console.log(`Program entry requirements updated (${updatedCount} rows). Skipped ${skippedCount} missing ids.`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
