'use client';

import { useEffect, useState } from 'react';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';

export const useUserRole = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Initialise from storage first (fast path, avoids nav flicker on subsequent loads)
    const sessionRole = sessionStorage.getItem('ascenda-session-role');
    const localRole = localStorage.getItem('ascenda-role');
    if (sessionRole || localRole) {
      setRole(sessionRole ?? localRole);
    }

    // If the user explicitly selected a role this session, don't overwrite it with the DB value
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
