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
    const supabase = createRouteHandlerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
      .filter((row: any): row is Record<string, unknown> => typeof row === 'object' && row !== null)
      .map((row: Record<string, unknown>) => {
        const normalized: Record<string, unknown> = {};
        Object.entries(row).forEach(([key, value]) => {
          if (value === '' || value === undefined) return;
          normalized[key] = typeof value === 'string' ? value.trim() : value;
        });
        return normalized;
      })
      .filter((row: Record<string, unknown>) => Object.keys(row).length > 0);

    if (sanitizedRows.length === 0) {
      return NextResponse.json({ error: 'Parsed rows were empty after sanitization.' }, { status: 400 });
    }

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
