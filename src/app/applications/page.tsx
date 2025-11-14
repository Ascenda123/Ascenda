import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { TaskList } from '@/components/dashboard/task-list';
import { DeadlineTimeline } from '@/components/dashboard/deadline-timeline';
import { DocumentUploader } from '@/components/applications/document-uploader';
import { ApplicationPriorityBoard, type PriorityItem } from '@/components/applications/application-priority-board';
import { RequirementTracker, type RequirementItem } from '@/components/applications/requirement-tracker';
import { PlannerCalendar, type PlannerEvent } from '@/components/applications/planner-calendar';
import { ReferenceTracker, type ReferenceItem } from '@/components/applications/reference-tracker';
import { SignalCenter, type SignalItem } from '@/components/applications/signal-center';

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

  type ApplicationRecord = {
    id: string;
    status: string;
    notes?: string | null;
    priority_score?: number | null;
    program_id: string;
    programs?: { name?: string | null; discipline?: string | null };
    universities?: { name?: string | null };
  };

  type ChecklistRecord = {
    id: string;
    task_name: string;
    status: 'todo' | 'doing' | 'done';
    due_date?: string | null;
    category?: string | null;
    owner?: string | null;
    application_id?: string | null;
  };

  type DeadlineRecord = {
    id: string;
    name: string;
    deadline_date?: string | null;
    intake?: string | null;
    program_id: string;
    type?: string | null;
  };

  const appRecords = ((applications ?? []) as ApplicationRecord[]) ?? [];
  const checklistRecords = ((checklists ?? []) as ChecklistRecord[]) ?? [];
  const deadlineRecords = ((deadlines ?? []) as DeadlineRecord[]) ?? [];

  const fallbackPriorities: PriorityItem[] = [
    {
      id: 'demo-oxford',
      program: 'PPE (Hons)',
      university: 'University of Oxford',
      priority: 'high',
      fitScore: 91,
      status: 'Essay polishing',
      nextDeadline: 'Oct 15',
      tasksRemaining: 3,
      scholarshipFocus: 'Rhodes shortlist'
    },
    {
      id: 'demo-stanford',
      program: 'Symbolic Systems BS',
      university: 'Stanford University',
      priority: 'medium',
      fitScore: 87,
      status: 'Testing plan',
      nextDeadline: 'Nov 1',
      tasksRemaining: 5,
      scholarshipFocus: 'Need-based aid'
    },
    {
      id: 'demo-nus',
      program: 'Engineering & Design BEng',
      university: 'NUS',
      priority: 'watch',
      fitScore: 80,
      status: 'Portfolio draft',
      nextDeadline: 'Dec 1',
      tasksRemaining: 2
    },
    {
      id: 'demo-utoronto',
      program: 'Rotman Commerce',
      university: 'University of Toronto',
      priority: 'medium',
      fitScore: 83,
      status: 'Reference waiting',
      nextDeadline: 'Jan 15',
      tasksRemaining: 4,
      scholarshipFocus: 'Lester B. Pearson'
    }
  ];

  const priorityItems: PriorityItem[] =
    appRecords.length > 0
      ? appRecords.map((app, index) => {
          const firstDeadline = deadlineRecords.find((deadline) => deadline.program_id === app.program_id);
          const fallbackPriority: PriorityItem['priority'][] = ['high', 'medium', 'watch'];
          return {
            id: app.id,
            program: app.programs?.name ?? 'Program',
            university: app.universities?.name ?? 'University partner',
            priority: fallbackPriority[index % fallbackPriority.length],
            fitScore: Math.round(app.priority_score ?? 75),
            status: app.status ?? 'In progress',
            nextDeadline: firstDeadline?.deadline_date ?? undefined,
            tasksRemaining: checklistRecords.filter((task) => task.status !== 'done' && task.application_id === app.id).length || 1,
            scholarshipFocus: app.notes ?? undefined
          };
        })
      : fallbackPriorities;

  const requirementItems: RequirementItem[] =
    checklistRecords.length > 0
      ? checklistRecords.map((task) => {
          const status: RequirementItem['status'] =
            task.status === 'done' ? 'submitted' : task.task_name.toLowerCase().includes('reference') ? 'requested' : 'pending';
          return {
            id: task.id,
            requirement: task.task_name,
            application: appRecords.find((app) => app.id === task.application_id)?.programs?.name ?? 'General',
            dueDate: task.due_date ?? undefined,
            owner: task.owner ?? (status === 'requested' ? 'Recommender' : 'You'),
            status
          };
        })
      : [
          {
            id: 'req-1',
            requirement: 'Common App essay',
            application: 'US Common App',
            dueDate: 'Sept 15',
            owner: 'You',
            status: 'pending'
          },
          {
            id: 'req-2',
            requirement: 'Counselor reference',
            application: 'LSE Law LLB',
            dueDate: 'Oct 1',
            owner: 'Ms. Kapur',
            status: 'requested'
          },
          {
            id: 'req-3',
            requirement: 'Portfolio PDF',
            application: 'Parsons Design BFA',
            dueDate: 'Nov 5',
            owner: 'You',
            status: 'submitted'
          }
        ];

  const plannerEvents: PlannerEvent[] =
    deadlineRecords.length > 0
      ? deadlineRecords.map((deadline) => ({
          id: deadline.id,
          title: deadline.name,
          date: deadline.deadline_date ?? 'TBD',
          category: 'deadline',
          detail: deadline.intake ?? 'Application'
        }))
      : [
          { id: 'event-1', title: 'Oxford UCAS deadline', date: '2024-10-15', category: 'deadline', detail: 'Submit UCAS + tests' },
          { id: 'event-2', title: 'Recommender reminder', date: '2024-09-01', category: 'reference', detail: 'Nudge Mr. Tan' },
          { id: 'event-3', title: 'Portfolio review', date: '2024-09-10', category: 'task', detail: 'Upload for Parsons' },
          { id: 'event-4', title: 'Wharton interview prep', date: '2024-11-02', category: 'interview', detail: 'Mock interview' }
        ];

  const referenceItems: ReferenceItem[] =
    checklistRecords.filter((task) => task.task_name.toLowerCase().includes('reference')).length > 0
      ? checklistRecords
          .filter((task) => task.task_name.toLowerCase().includes('reference'))
          .map((task, index) => ({
            id: task.id,
            name: task.owner ?? `Recommender ${index + 1}`,
            relationship: task.category ?? 'Teacher',
            school: appRecords.find((app) => app.id === task.application_id)?.universities?.name ?? 'Multiple schools',
            dueDate: task.due_date ?? undefined,
            status: task.status === 'done' ? 'received' : 'sent',
            lastNudged: task.status === 'done' ? undefined : '3d ago'
          }))
      : [
          {
            id: 'ref-1',
            name: 'Mrs. Kapoor',
            relationship: 'IB Coordinator',
            school: 'Oxford + LSE',
            dueDate: 'Sep 30',
            status: 'sent',
            lastNudged: '2d ago'
          },
          {
            id: 'ref-2',
            name: 'Coach Alvarez',
            relationship: 'Extracurricular mentor',
            school: 'Stanford',
            dueDate: 'Oct 5',
            status: 'drafted'
          },
          {
            id: 'ref-3',
            name: 'Mr. Tan',
            relationship: 'Physics teacher',
            school: 'NUS',
            dueDate: 'Oct 12',
            status: 'received',
            lastNudged: '5d ago'
          }
        ];

  const signalItems: SignalItem[] =
    deadlineRecords.length > 0
      ? deadlineRecords.slice(0, 3).map((deadline) => ({
          id: deadline.id,
          title: `${deadline.name} updated`,
          detail: `Deadline is now ${deadline.deadline_date ?? 'TBD'} for ${deadline.intake ?? 'current intake'}.`,
          timeAgo: 'Just now',
          type: 'deadline'
        }))
      : [
          {
            id: 'signal-1',
            title: 'MIT advanced action window opens next week',
            detail: 'Portal invites released Aug 28. Prep your interview availability.',
            timeAgo: '1h ago',
            type: 'portal'
          },
          {
            id: 'signal-2',
            title: 'New Singapore Global Citizen scholarship',
            detail: 'S$80k total award for STEM majors—deadline Oct 1.',
            timeAgo: '4h ago',
            type: 'scholarship'
          },
          {
            id: 'signal-3',
            title: 'Parsons portfolio requirement clarified',
            detail: 'Add 2 fabrications or motion studies before submitting.',
            timeAgo: '1d ago',
            type: 'task'
          }
        ];

  const checklistTasks = checklistRecords.map((task) => ({
    id: task.id,
    name: task.task_name,
    status: task.status,
    dueDate: task.due_date ?? undefined
  }));

  const timelineItems = deadlineRecords.map((deadline) => ({
    id: deadline.id,
    name: deadline.name,
    date: deadline.deadline_date ?? 'TBD',
    context: deadline.intake ?? 'Submission'
  }));

  return (
    <DashboardShell>
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Application planner</h1>
        <p className="text-sm text-slate-500">
          Prioritize, schedule, and execute every requirement—documents, references, tasks, and signals in one calm space.
        </p>
      </section>

      <div className="space-y-8">
        <ApplicationPriorityBoard items={priorityItems} />

        <PlannerCalendar events={plannerEvents} />

        <RequirementTracker items={requirementItems} />

        <div className="space-y-6">
          <TaskList title="Your checklist" tasks={checklistTasks} />
          <ReferenceTracker references={referenceItems} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <h2 className="text-2xl font-semibold text-slate-900">Upload documents</h2>
            <DocumentUploader />
          </div>
          <SignalCenter signals={signalItems} />
          <div className="space-y-4 rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <h2 className="text-2xl font-semibold text-slate-900">Upcoming deadlines</h2>
            <DeadlineTimeline items={timelineItems} />
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-100 bg-white p-6 text-sm text-slate-600 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          {appRecords.length > 0 ? (
            <ul className="space-y-2">
              {appRecords.map((app) => (
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
      </div>
    </DashboardShell>
  );
}
