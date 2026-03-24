import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/shell';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function CounsellorLayout({ children }: { children: ReactNode }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'counsellor') {
    redirect('/dashboard');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
