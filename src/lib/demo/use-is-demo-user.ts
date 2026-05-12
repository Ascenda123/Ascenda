'use client';

import { useEffect, useState } from 'react';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';
import { DEMO_EMAIL, isDemoUser } from './demo-profile';

const CACHE_KEY = 'ascenda-is-demo';

export const useIsDemoUser = (): boolean => {
  const [isDemo, setIsDemo] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(CACHE_KEY) === '1';
  });

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    let cancelled = false;

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      const email = data?.user?.email;
      const result = isDemoUser(email);
      setIsDemo(result);
      sessionStorage.setItem(CACHE_KEY, result ? '1' : '0');
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return isDemo;
};

export { DEMO_EMAIL };
