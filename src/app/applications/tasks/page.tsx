import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { TaskList } from '@/components/dashboard/task-list';

export const metadata: Metadata = {
  title: 'Checklist | Ascenda'
};

export default async function ChecklistPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: tasks } = await supabase
    .from('application_checklist')
    .select('*')
    .eq('status', 'todo')
    .order('due_date', { ascending: true });

  return (
    <DashboardShell>
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Checklist</h1>
        <p className="text-sm text-slate-600">Action items grouped across all applications.</p>
      </section>
      <TaskList
        title="Tasks to complete"
        tasks={(tasks ?? []).map((task) => ({
          id: task.id,
          name: task.task_name,
          status: task.status,
          dueDate: task.due_date ?? undefined
        }))}
      />
    </DashboardShell>
  );
}
