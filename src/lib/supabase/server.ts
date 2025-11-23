import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import { createServerComponentClient, createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { createRouteHandlerClient, type SupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '../types/database';

type Client = SupabaseClient<Database>;

export const createServerSupabaseClient = (): Client => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};

export const createServerActionSupabaseClient = (): Client => {
  const cookieStore = cookies();
  return createServerActionClient<Database>({ cookies: () => cookieStore });
};

export const createRouteHandlerSupabaseClient = () => {
  const cookieStore = cookies();
  return createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  });
};
