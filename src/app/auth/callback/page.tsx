'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';
import { isProfileComplete } from '@/lib/profile/completion';

const FALLBACK_REDIRECT = '/dashboard';

const parseHashParams = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  if (!hash) {
    return null;
  }
  return new URLSearchParams(hash);
};

import { Suspense } from 'react';

function AuthCallbackContent() {
  const supabase = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) {
      return;
    }
    handledRef.current = true;

    const next = searchParams.get('next');
    const code = searchParams.get('code');
    const hashParams = parseHashParams();
    const accessToken = hashParams?.get('access_token');
    const refreshToken = hashParams?.get('refresh_token');

    const normalizeNext = (candidate: string | null) => {
      if (!candidate) return null;
      return candidate.startsWith('/') ? candidate : null;
    };

    const resolveRedirectTarget = async () => {
      const requestedNext = normalizeNext(next);
      if (requestedNext) {
        return requestedNext;
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        return FALLBACK_REDIRECT;
      }

      const [personalResponse, academicResponse, lifestyleResponse, subjectResponse] = await Promise.all([
        supabase
          .from('student_personal_information')
          .select('first_name,last_name,email,nationality,resident_country')
          .eq('profile_id', user.id)
          .maybeSingle(),
        supabase
          .from('student_academic_input')
          .select('programme_type,school_name,school_country,graduation_year,intended_clusters,english_required')
          .eq('profile_id', user.id)
          .maybeSingle(),
        supabase.from('student_lifestyle_preference').select('extracurricular_interests').eq('profile_id', user.id).maybeSingle(),
        supabase.from('student_subjects').select('id').eq('profile_id', user.id)
      ]);

      const firstError = [personalResponse.error, academicResponse.error, lifestyleResponse.error, subjectResponse.error].find(Boolean);
      if (firstError) {
        console.error('Unable to determine onboarding status', firstError);
        return FALLBACK_REDIRECT;
      }

      const needsOnboarding = !isProfileComplete({
        personal: personalResponse.data ?? null,
        academicInput: academicResponse.data ?? null,
        subjectCount: subjectResponse.data?.length ?? 0,
        lifestyle: lifestyleResponse.data ?? null
      });

      return needsOnboarding ? '/profile/wizard' : FALLBACK_REDIRECT;
    };

    const handleAuthCallback = async () => {
      try {
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        } else if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
        }
      } catch (err) {
        console.error('Failed to complete auth callback', err);
      } finally {
        const target = await resolveRedirectTarget();
        router.replace(target);
      }
    };

    void handleAuthCallback();
  }, [router, searchParams, supabase]);

  return (
    <div className="space-y-3">
      <p className="text-lg font-semibold text-foreground">Finishing sign-in…</p>
      <p className="text-sm text-muted-foreground">You will be redirected shortly.</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16 text-center text-foreground">
      <Suspense fallback={<p>Loading...</p>}>
        <AuthCallbackContent />
      </Suspense>
    </main>
  );
}
