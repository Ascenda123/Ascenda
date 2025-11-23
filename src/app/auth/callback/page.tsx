'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';

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

    const next = searchParams.get('next') ?? FALLBACK_REDIRECT;
    const code = searchParams.get('code');
    const hashParams = parseHashParams();
    const accessToken = hashParams?.get('access_token');
    const refreshToken = hashParams?.get('refresh_token');

    const finish = () => {
      router.replace(next);
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
        finish();
      }
    };

    void handleAuthCallback();
  }, [router, searchParams, supabase]);

  return (
    <div className="space-y-3">
      <p className="text-lg font-semibold">Finishing sign-in…</p>
      <p className="text-sm text-slate-500">You will be redirected shortly.</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16 text-center text-slate-900">
      <Suspense fallback={<p>Loading...</p>}>
        <AuthCallbackContent />
      </Suspense>
    </main>
  );
}

