import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
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

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');

  // Helper to carry over cookies to redirects
  const applyCookies = (source: NextResponse, target: NextResponse) => {
    source.cookies.getAll().forEach((cookie) => {
      target.cookies.set(cookie);
    });
  };

  const getOnboardingStatus = async (response: NextResponse) => {
    if (!session) {
      return false;
    }

    const cachedUserId = req.cookies.get('onboarding_complete')?.value;
    if (cachedUserId === session.user.id) {
      return false;
    }

    const statusCookie = req.cookies.get('onboarding_status')?.value;
    if (statusCookie) {
      const [userId, status, timestamp] = statusCookie.split(':');
      const ageMinutes = timestamp ? (Date.now() - Number(timestamp)) / (1000 * 60) : Number.POSITIVE_INFINITY;
      if (userId === session.user.id) {
        if (status === 'complete') {
          response.cookies.set('onboarding_complete', session.user.id, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
          });
          return false;
        }
        if (status === 'pending' && ageMinutes < 60) {
          return true;
        }
      }
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
      response.cookies.set('onboarding_complete', session.user.id, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });
      response.cookies.set('onboarding_status', `${session.user.id}:complete:${Date.now()}`, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });
    } else {
      response.cookies.set('onboarding_status', `${session.user.id}:pending:${Date.now()}`, {
        path: '/',
        maxAge: 60 * 60 * 12,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });
    }

    return needsOnboarding;
  };

  if (!session && isProtected) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    applyCookies(res, redirectResponse);
    return redirectResponse;
  }

  if (session && isAuthRoute) {
    const redirectUrl = req.nextUrl.clone();
    const needsOnboarding = await getOnboardingStatus(res);
    redirectUrl.pathname = needsOnboarding ? '/profile' : '/dashboard';
    if (needsOnboarding) {
      redirectUrl.searchParams.set('onboarding', 'true');
    }
    redirectUrl.searchParams.delete('redirectedFrom');
    const redirectResponse = NextResponse.redirect(redirectUrl);
    applyCookies(res, redirectResponse);
    return redirectResponse;
  }

  if (session && isProtected && !pathname.startsWith('/profile')) {
    const needsOnboarding = await getOnboardingStatus(res);
    if (needsOnboarding) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/profile';
      redirectUrl.searchParams.set('onboarding', 'true');
      const redirectResponse = NextResponse.redirect(redirectUrl);
      applyCookies(res, redirectResponse);
      return redirectResponse;
    }
  }

  return res;
}

export const config = {
  matcher: ['/(dashboard|profile|matches|applications|admin|university-search|course|shortlist|scholarships)(.*)', '/login', '/signup']
};
