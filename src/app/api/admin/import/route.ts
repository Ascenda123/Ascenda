import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server';

const templateTableMap = {
  universities: 'universities',
  programs: 'programs',
  requirements: 'program_requirements',
  deadlines: 'deadlines'
} as const;

type TemplateKey = keyof typeof templateTableMap;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const template = body?.template as TemplateKey | undefined;
    const rows = Array.isArray(body?.rows) ? body.rows : [];

    if (!template || !(template in templateTableMap)) {
      return NextResponse.json({ error: 'Invalid dataset template.' }, { status: 400 });
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided for import.' }, { status: 400 });
    }

    const sanitizedRows = rows
      .filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
      .map((row) => {
        const normalized: Record<string, unknown> = {};
        Object.entries(row).forEach(([key, value]) => {
          if (value === '' || value === undefined) return;
          normalized[key] = typeof value === 'string' ? value.trim() : value;
        });
        return normalized;
      })
      .filter((row) => Object.keys(row).length > 0);

    if (sanitizedRows.length === 0) {
      return NextResponse.json({ error: 'Parsed rows were empty after sanitization.' }, { status: 400 });
    }

    const supabase = createRouteHandlerSupabaseClient();
    const table = templateTableMap[template];

    const { error } = await supabase.from(table).upsert(sanitizedRows, { onConflict: 'id' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ count: sanitizedRows.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
