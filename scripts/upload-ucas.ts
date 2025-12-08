import fs from 'fs';
import path from 'path';
// @ts-ignore papaparse lacks types here
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';

type Row = Record<string, unknown>;

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const uniqueByKey = (rows: Row[], key: string): Row[] => {
  const map = new Map<string, Row>();
  rows.forEach((row) => {
    const value = row[key];
    if (typeof value === 'string') {
      if (!map.has(value)) map.set(value, row);
    }
  });
  return Array.from(map.values());
};

const readCsv = (filePath: string): Row[] => {
  const contents = fs.readFileSync(filePath, 'utf-8');
  const parsed = Papa.parse(contents, { header: true, skipEmptyLines: true });
  if (parsed.errors.length) {
    const message = parsed.errors.map((e: any) => `${e.message} at row ${e.row}`).join('; ');
    throw new Error(`CSV parse errors in ${filePath}: ${message}`);
  }
  return parsed.data
    .map((row: Row) => {
      const normalized: Row = {};
      Object.entries(row).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (typeof value === 'string') {
          const trimmed = value.trim();
          const first = trimmed[0];
          const last = trimmed[trimmed.length - 1];
          if (
            trimmed.length > 1 &&
            ((first === '{' && last === '}') || (first === '[' && last === ']'))
          ) {
            try {
              normalized[key] = JSON.parse(trimmed);
              return;
            } catch {
              // keep as string
            }
          }
          normalized[key] = trimmed;
          return;
        }
        normalized[key] = value;
      });
      if (normalized.name && !normalized.course_name) {
        normalized.course_name = normalized.name;
      }
      if (normalized.course_name && !normalized.name) {
        normalized.name = normalized.course_name;
      }
      return normalized;
    })
    .filter((row: Row) => Object.keys(row).length > 0);
};

const upsertTable = async (table: string, rows: Row[], onConflict: string) => {
  if (!rows.length) return;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  }
  const supabase = createClient(supabaseUrl, serviceRole);
  for (const batch of chunk(rows, 500)) {
    const { error } = await supabase.from(table).upsert(batch, { onConflict });
    if (error) throw error;
  }
};

const main = async () => {
  const dirFlagIndex = process.argv.indexOf('--dir');
  const dir = dirFlagIndex !== -1 ? process.argv[dirFlagIndex + 1] : 'supabase/imports';

  const universities = readCsv(path.join(dir, 'universities.csv'));
  const programs = uniqueByKey(readCsv(path.join(dir, 'programs.csv')), 'id');
  const requirements = uniqueByKey(readCsv(path.join(dir, 'program_requirements.csv')), 'program_id');

  console.log(`Upserting ${universities.length} universities...`);
  await upsertTable('universities', universities, 'id');

  console.log(`Upserting ${programs.length} programs...`);
  await upsertTable('programs', programs, 'id');

  console.log(`Upserting ${requirements.length} program requirements...`);
  await upsertTable('program_requirements', requirements, 'program_id');

  console.log('Import complete.');
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
