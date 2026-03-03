'use client';

import { useEffect, useState } from 'react';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';

export const useUserRole = () => {
  const [role, setRole] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    // Session-selected role takes priority (set by /role-select, cleared on browser session end)
    return sessionStorage.getItem('ascenda-session-role') ?? localStorage.getItem('ascenda-role') ?? null;
  });

  useEffect(() => {
    // If the user explicitly selected a role this session, don't overwrite it with the DB value
    const sessionRole = sessionStorage.getItem('ascenda-session-role');
    if (sessionRole) return;

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
