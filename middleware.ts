import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/types/database';
import { isProfileComplete } from '@/lib/profile/completion';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/profile',
  '/matches',
  '/applications',
  '/admin',
  '/university-search',
  '/course',
  '/shortlist',
  '/scholarships'
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');

  const getOnboardingStatus = async () => {
    if (!session) {
      return false;
    }

    const cachedUserId = req.cookies.get('onboarding_complete')?.value;
    if (cachedUserId === session.user.id) {
      return false;
    }

    const [profileResponse, academicsResponse, preferencesResponse, aspirationsResponse] = await Promise.all([
      supabase.from('profiles').select('full_name,country,time_zone').eq('id', session.user.id).maybeSingle(),
      supabase.from('student_academics').select('curriculum').eq('profile_id', session.user.id).maybeSingle(),
      supabase.from('student_preferences').select('countries').eq('profile_id', session.user.id).maybeSingle(),
      supabase.from('student_aspirations').select('target_fields').eq('profile_id', session.user.id).maybeSingle()
    ]);

    const completionRecords = {
      profile: profileResponse.data ?? null,
      academics: academicsResponse.data ?? null,
      preferences: preferencesResponse.data ?? null,
      aspirations: aspirationsResponse.data ?? null
    };

    const needsOnboarding = !isProfileComplete(completionRecords);

    if (!needsOnboarding) {
      res.cookies.set('onboarding_complete', session.user.id, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      });
    }

    return needsOnboarding;
  };

  if (!session && isProtected) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && isAuthRoute) {
    const redirectUrl = req.nextUrl.clone();
    const needsOnboarding = await getOnboardingStatus();
    redirectUrl.pathname = needsOnboarding ? '/profile' : '/dashboard';
    if (needsOnboarding) {
      redirectUrl.searchParams.set('onboarding', 'true');
    }
    redirectUrl.searchParams.delete('redirectedFrom');
    return NextResponse.redirect(redirectUrl);
  }

  if (session && isProtected && !pathname.startsWith('/profile')) {
    const needsOnboarding = await getOnboardingStatus();
    if (needsOnboarding) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/profile';
      redirectUrl.searchParams.set('onboarding', 'true');
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ['/(dashboard|profile|matches|applications|admin|university-search|course|shortlist|scholarships)(.*)', '/login', '/signup']
};
