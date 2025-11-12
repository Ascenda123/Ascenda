import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { ImportPanel } from './_components/import-panel';

export const metadata: Metadata = {
  title: 'Admin console | Ascenda'
};

export default async function AdminPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const { data: sources } = await supabase.from('sources').select('*').order('last_scraped_at', { ascending: false });

  return (
    <DashboardShell>
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Admin console</h1>
        <p className="text-sm text-slate-600">Manage catalog data, data freshness, and system health.</p>
      </section>
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <ImportPanel />
        <aside className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">Data sources</h2>
          <ul className="space-y-3 text-sm text-slate-600">
            {(sources ?? []).map((source) => (
              <li key={source.id}>
                <p className="font-semibold text-slate-900">{source.name}</p>
                <p>{source.url ?? 'No URL provided'}</p>
                <p className="text-xs text-slate-500">Last scraped: {source.last_scraped_at ?? 'Never'}</p>
              </li>
            ))}
            {(sources ?? []).length === 0 ? <li>No sources yet.</li> : null}
          </ul>
        </aside>
      </div>
    </DashboardShell>
  );
}
