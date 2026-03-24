import { NextResponse, type NextRequest } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/role-select';

  if (code) {
    const supabase = createRouteHandlerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, req.url));
    }

    console.error('Auth callback code exchange failed:', error.message);
  }

  // If no code or exchange failed, redirect to login
  return NextResponse.redirect(new URL('/login', req.url));
}
