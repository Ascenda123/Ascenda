'use client';

import { useMemo } from 'react';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

export const useSupabase = (): SupabaseClient<Database> => {
  return useMemo(() => getBrowserSupabaseClient(), []);
};
