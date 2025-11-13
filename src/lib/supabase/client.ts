import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '../types/database';

let client: SupabaseClient<Database> | undefined;

export const getBrowserSupabaseClient = (): SupabaseClient<Database> => {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error('Missing Supabase browser credentials');
    }

    client = createClientComponentClient<Database>({
      supabaseUrl: url,
      supabaseKey: anonKey,
      options: {
        realtime: {
          params: {
            eventsPerSecond: 2
          }
        }
      }
    });
  }

  return client;
};
