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

const BATCH_SIZE = 500;

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

const buildUpdates = (rows: CsvRow[]): ProgramUpdate[] =>
  rows.map((row) => ({
    id: row.id,
    min_alevel: trimOrNull(row.min_alevel),
    min_ib: trimOrNull(row.min_ib),
    additional_entry_requirements: trimOrNull(row.additional_entry_requirements)
  }));

const main = async () => {
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

  const rows = readCsv(inputPath);
  const updates = buildUpdates(rows);
  console.log(`Prepared ${updates.length} program updates from ${inputPath}.`);

  const supabase = createClient(supabaseUrl, serviceRole);
  for (const batch of chunk(updates, BATCH_SIZE)) {
    const { error } = await supabase.from('programs').upsert(batch, { onConflict: 'id' });
    if (error) {
      throw new Error(`Programs update failed: ${error.message}`);
    }
  }
  console.log('Program entry requirements updated.');
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
