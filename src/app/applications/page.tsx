import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { TaskList } from '@/components/dashboard/task-list';
import { DeadlineTimeline } from '@/components/dashboard/deadline-timeline';
import { DocumentUploader } from '@/components/applications/document-uploader';

export const metadata: Metadata = {
  title: 'Applications | Ascenda'
};

export default async function ApplicationsPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [{ data: applications }] = await Promise.all([
    supabase.from('applications').select('*, programs(*), universities:programs(university_id)').eq('profile_id', user.id)
  ]);

  const { data: checklists } = await supabase
    .from('application_checklist')
    .select('*')
    .in('application_id', (applications ?? []).map((app) => app.id));

  const { data: deadlines } = await supabase
    .from('deadlines')
    .select('*')
    .in('program_id', (applications ?? []).map((app) => app.program_id))
    .order('deadline_date', { ascending: true });

  return (
    <DashboardShell>
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Application planner</h1>
        <p className="text-sm text-slate-500">Track statuses, deadlines, tasks, and documents in one workspace.</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <TaskList
            title="Your checklist"
            tasks={(checklists ?? []).map((task) => ({
              id: task.id,
              name: task.task_name,
              status: task.status,
              dueDate: task.due_date ?? undefined
            }))}
          />
          <div className="space-y-4 rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <h2 className="text-2xl font-semibold text-slate-900">Upload documents</h2>
            <DocumentUploader />
          </div>
        </div>
        <aside className="space-y-6">
          <div className="space-y-4 rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <h2 className="text-2xl font-semibold text-slate-900">Upcoming deadlines</h2>
            <DeadlineTimeline
              items={(deadlines ?? []).map((deadline) => ({
                id: deadline.id,
                name: deadline.name,
                date: deadline.deadline_date ?? 'TBD',
                context: deadline.intake ?? 'Submission'
              }))}
            />
          </div>
          <div className="rounded-[28px] border border-slate-100 bg-white p-6 text-sm text-slate-600 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            {applications && applications.length > 0 ? (
              <ul className="space-y-2">
                {applications.map((app) => (
                  <li key={app.id}>
                    <p className="font-semibold text-slate-900">Application status</p>
                    <p>
                      {app.status} • {app.notes ?? 'No notes yet'}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No applications yet. Save programs from the matches page to begin planning.</p>
            )}
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
