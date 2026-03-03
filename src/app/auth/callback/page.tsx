'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';
import { isProfileComplete } from '@/lib/profile/completion';

const FALLBACK_REDIRECT = '/role-select';

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

function AuthCallbackContent() {
  const supabase = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const handledRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const hashParams = parseHashParams();
    const accessToken = hashParams?.get('access_token');
    const refreshToken = hashParams?.get('refresh_token');

    if (handledRef.current) return;

    // If no params yet, wait for Next.js to populate them
    if (!code && !accessToken) {
      const timer = setTimeout(() => {
        if (!handledRef.current) {
          handledRef.current = true;
          router.replace(FALLBACK_REDIRECT);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }

    handledRef.current = true;

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
        setTimeout(() => {
          router.replace(FALLBACK_REDIRECT);
        }, 500);
      }
    };

    void handleAuthCallback();
  }, [router, searchParams, supabase]);

  return (
    <div className="space-y-3 px-4">
      <div className="relative mx-auto h-2 w-48 overflow-hidden rounded-full bg-muted/60">
        <div className="absolute inset-0 translate-x-[-100%] animate-shimmer bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
      <p className="text-lg font-semibold text-foreground">Finishing sign-in…</p>
      <p className="text-sm text-muted-foreground">You will be redirected shortly.</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16 text-center text-foreground">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <AuthCallbackContent />
      </Suspense>
    </main>
  );
}
