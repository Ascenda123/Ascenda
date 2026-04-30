import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { TaskList } from '@/components/dashboard/task-list';
import { SectionNav } from '@/components/layout/section-nav';
import { PLANNER_SECTION_ITEMS } from '@/components/layout/navigation';

export const metadata: Metadata = {
  title: 'Tasks'
};

export default async function TasksPage() {
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
      <SectionNav items={PLANNER_SECTION_ITEMS} />
      <section className="space-y-2">
        <h1 className="text-[22px] font-semibold leading-snug text-foreground md:text-[28px]">Tasks</h1>
        <p className="text-sm text-muted-foreground">Action items grouped across all applications.</p>
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
