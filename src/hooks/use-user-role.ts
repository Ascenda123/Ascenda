'use client';

import { useEffect, useState } from 'react';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';

export const useUserRole = () => {
  const [role, setRole] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('ascenda-role') ?? null;
  });

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    supabase.auth
      .getUser()
      .then(({ data }) => {
        const userId = data?.user?.id;
        if (!userId) {
          setRole(null);
          return null;
        }
        return supabase.from('profiles').select('role').eq('id', userId).single();
      })
      .then((response) => {
        if (response && 'data' in response) {
          setRole(response.data?.role ?? null);
        }
      })
      .catch(() => {
        setRole(null);
      });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (role) {
      localStorage.setItem('ascenda-role', role);
    } else {
      localStorage.removeItem('ascenda-role');
    }
  }, [role]);

  return role;
};
