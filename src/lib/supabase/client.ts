
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

let client: SupabaseClient<Database> | undefined;

export const getBrowserSupabaseClient = () => {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error('Missing Supabase browser credentials');
    }

    client = createBrowserClient<Database>(url, anonKey);
  }

  return client;
};
