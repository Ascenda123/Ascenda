import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { DeadlineTimeline } from '@/components/dashboard/deadline-timeline';
import { DocumentUploader } from '@/components/applications/document-uploader';
import { ApplicationPriorityBoard, type PriorityItem } from '@/components/applications/application-priority-board';
import { RequirementTracker, type RequirementItem } from '@/components/applications/requirement-tracker';
import { PlannerCalendar, type PlannerEvent } from '@/components/applications/planner-calendar';
import { ReferenceTracker, type ReferenceItem } from '@/components/applications/reference-tracker';
import { SignalCenter, type SignalItem } from '@/components/applications/signal-center';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { SectionNav } from '@/components/layout/section-nav';
import { PLANNER_SECTION_ITEMS } from '@/components/layout/navigation';
import { StudentWorkspaceDock } from '@/components/layout/student-workspace-dock';

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

  const { data: applications } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      notes,
      program_id,
      program:programs(
        id,
        name:course_name,
        level:study_level,
        universities(name,country),
        deadlines(
          id,
          name,
          deadline_date,
          intake,
          program_id
        )
      ),
      application_checklist(
        id,
        task_name,
        status,
        due_date,
        application_id
      )
    `)
    .eq('profile_id', user.id);

  type ApplicationRecord = {
    id: string;
    status: string;
    notes?: string | null;
    priority_score?: number | null;
    program_id: string;
    program?: {
      id: string;
      name?: string | null;
      level?: string | null;
      universities?: { name?: string | null; country?: string | null } | null;
      deadlines?: DeadlineRecord[] | null;
    } | null;
    application_checklist?: ChecklistRecord[] | null;
  };

  type ChecklistRecord = {
    id: string;
    task_name: string;
    status: 'todo' | 'doing' | 'done';
    due_date?: string | null;
    application_id?: string | null;
  };

  type DeadlineRecord = {
    id: string;
    name: string;
    deadline_date?: string | null;
    intake?: string | null;
    program_id: string;
  };

  const appRecords = ((applications ?? []) as ApplicationRecord[]) ?? [];
  const checklistRecords = appRecords.flatMap((app) => app.application_checklist ?? []);
  const deadlineRecords = appRecords.flatMap((app) => app.program?.deadlines ?? []);
  deadlineRecords.sort((a, b) => {
    const first = a.deadline_date ? new Date(a.deadline_date).getTime() : Number.POSITIVE_INFINITY;
    const second = b.deadline_date ? new Date(b.deadline_date).getTime() : Number.POSITIVE_INFINITY;
    return first - second;
  });

  const parsePriorityScore = (score?: number | string | null) => {
    if (typeof score === 'number') return score;
    if (typeof score === 'string') {
      const parsed = Number.parseFloat(score);
      return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
  };

  const derivePriority = (score: number | null): PriorityItem['priority'] => {
    if (score === null) return 'watch';
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'watch';
  };

  if (appRecords.length === 0) {
    return (
      <DashboardShell>
        <SectionNav items={PLANNER_SECTION_ITEMS} />
        <PageHero
          eyebrow="Applications"
          title="Application workspace"
          description="Track applications, requirements, and signals in one place once you add programs."
          highlight="No applications yet"
          stats={[
            { label: 'Applications', value: '0', detail: 'Tracked' },
            { label: 'Deadlines', value: '—', detail: 'Awaiting programs' },
            { label: 'Signals', value: '—', detail: 'Add programs first' }
          ]}
          breadcrumbs={<Breadcrumbs />}
          actions={
            <>
              <Button asChild size="sm">
                <Link href="/matches">Add from matches</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/university-search/search">Browse universities</Link>
              </Button>
            </>
          }
        />
        <div className="rounded-[28px] border border-dashed border-border bg-muted/40 p-10 text-center text-muted-foreground">
          <p className="text-base font-semibold text-foreground">Nothing here yet</p>
          <p className="mt-2 text-sm">
            Save a program from matches or search to start planning tasks, deadlines, and documents.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Button asChild size="sm">
              <Link href="/matches">Find matches</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/university-search/search">Open search</Link>
            </Button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const priorityItems: PriorityItem[] =
    appRecords.length > 0
      ? appRecords.map((app) => {
        const score = parsePriorityScore(app.priority_score);
        const firstDeadline = deadlineRecords.find((deadline) => deadline.program_id === app.program_id);
        return {
          id: app.id,
          program: app.program?.name ?? 'Program',
          university: app.program?.universities?.name ?? 'University partner',
          priority: derivePriority(score),
          fitScore: score,
          status: app.status ?? 'In progress',
          nextDeadline: firstDeadline?.deadline_date ?? undefined,
          tasksRemaining: checklistRecords.filter((task) => task.status !== 'done' && task.application_id === app.id).length,
          scholarshipFocus: app.notes ?? undefined
        };
      })
      : [];

  const requirementItems: RequirementItem[] =
    checklistRecords.length > 0
      ? checklistRecords.map((task) => {
        const status: RequirementItem['status'] =
          task.status === 'done' ? 'submitted' : task.task_name.toLowerCase().includes('reference') ? 'requested' : 'pending';
        return {
          id: task.id,
          requirement: task.task_name,
          application: appRecords.find((app) => app.id === task.application_id)?.program?.name ?? 'General',
          dueDate: task.due_date ?? undefined,
          owner: status === 'requested' ? 'Recommender' : 'You',
          status
        };
      })
      : [];

  const plannerEvents: PlannerEvent[] =
    deadlineRecords.length > 0
      ? deadlineRecords
        .map((deadline) => ({
          id: deadline.id,
          title: deadline.name,
          date: deadline.deadline_date ?? '',
          category: 'deadline' as const,
          detail: deadline.intake ?? 'Application'
        }))
        .filter((event) => event.date && !Number.isNaN(new Date(event.date).getTime()))
      : [];

  const today = new Date();
  const isSameDay = (value?: string | null) => {
    if (!value) return false;
    const candidate = new Date(value);
    return !Number.isNaN(candidate.getTime()) && candidate.toDateString() === today.toDateString();
  };

  const dailySummary = {
    tasks: checklistRecords.filter((task) => isSameDay(task.due_date)).length,
    deadlines: deadlineRecords.filter((deadline) => isSameDay(deadline.deadline_date)).length,
    interviews: plannerEvents.filter((event) => event.category === 'interview' && isSameDay(event.date)).length
  };

  const disciplineFocus = appRecords[0]?.program?.name ?? 'university';
  const resourceHighlights = [
    {
      id: 'essay-template',
      tag: 'Templates',
      title: `${disciplineFocus} essay planner`,
      description: `Map your story arcs for relevant prompts with this guided outline.`,
      href: 'https://www.commonapp.org/'
    },
    {
      id: 'interview-prep',
      tag: 'Interview',
      title: 'Interview prep checklist',
      description: 'Practice STAR stories and quick intros before your alumni interviews.',
      href: 'https://www.linkedin.com/learning/interviewing'
    },
    {
      id: 'scholarship-spotlight',
      tag: 'Scholarships',
      title: 'Regional scholarship spotlight',
      description: 'Weekly roundups tailored to the regions on your program list.',
      href: 'https://www.scholarshiphunter.com/'
    },
    {
      id: 'reference-guide',
      tag: 'References',
      title: 'Recommender checklist',
      description: 'Share a one-pager with your ref so they know what deadlines matter most.',
      href: 'https://www.ucanews.com/'
    }
  ];

  const referenceItems: ReferenceItem[] =
    checklistRecords.filter((task) => task.task_name.toLowerCase().includes('reference')).length > 0
      ? checklistRecords
        .filter((task) => task.task_name.toLowerCase().includes('reference'))
        .map((task, index) => ({
          id: task.id,
          name: `Recommender ${index + 1}`,
          relationship: 'Teacher',
          school: appRecords.find((app) => app.id === task.application_id)?.program?.universities?.name ?? 'Multiple schools',
          dueDate: task.due_date ?? undefined,
          status: task.status === 'done' ? 'received' : 'sent',
          lastNudged: undefined
        }))
      : [];

  const signalItems: SignalItem[] =
    deadlineRecords.length > 0
      ? deadlineRecords.slice(0, 3).map((deadline) => ({
        id: deadline.id,
        title: `${deadline.name} updated`,
        detail: `Deadline is now ${deadline.deadline_date ?? 'TBD'} for ${deadline.intake ?? 'current intake'}.`,
        timeAgo: 'Just now',
        type: 'deadline'
      }))
      : [];

  const timelineItems = deadlineRecords.map((deadline) => ({
    id: deadline.id,
    name: deadline.name,
    date: deadline.deadline_date ?? 'TBD',
    context: deadline.intake ?? 'Submission'
  }));

  const heroStats = [
    { label: 'Applications', value: `${appRecords.length}`, detail: 'Tracked' },
    { label: 'Deadlines', value: `${deadlineRecords.length}`, detail: 'Synced' },
    { label: 'Signals', value: `${signalItems.length}`, detail: 'Latest updates' }
  ];

  return (
    <DashboardShell>
      <SectionNav items={PLANNER_SECTION_ITEMS} />
      <PageHero
        eyebrow="Applications"
        title="Application workspace"
        description="Prioritize, schedule, and execute every requirement—documents, references, tasks, and signals in one calm space."
        highlight={`Today • ${dailySummary.tasks} tasks, ${dailySummary.deadlines} deadlines`}
        stats={heroStats}
        breadcrumbs={<Breadcrumbs />}
        actions={
          <>
            <Button asChild size="sm" variant="soft">
              <Link className="text-foreground" href="/matches">
                Add from matches
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/applications/tasks">Open tasks</Link>
            </Button>
          </>
        }
      />

      <div className="space-y-8">
        <StudentWorkspaceDock
          current="applications"
          metrics={{
            dashboard: { value: `${dailySummary.tasks}`, detail: 'tasks due today' },
            matches: { value: 'Matches', detail: 'send strong options to planner' },
            applications: { value: `${appRecords.length}`, detail: 'active applications tracked' },
            profile: { value: 'Profile', detail: 'keep requirements accurate' },
            search: { value: 'Search', detail: 'discover more programs' }
          }}
        />
        <ApplicationPriorityBoard items={priorityItems} />

        {/* Quick links to documents & sandbox */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/applications/documents"
            className="surface-card group flex items-center gap-4 rounded-[28px] p-5 transition hover:-translate-y-0.5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/20 dark:text-violet-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Document centre</p>
              <p className="text-xs text-muted-foreground">Rec letters, transcripts, and uploads</p>
            </div>
          </Link>
          <Link
            href="/applications/sandbox"
            className="surface-card group flex items-center gap-4 rounded-[28px] p-5 transition hover:-translate-y-0.5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Application sandbox</p>
              <p className="text-xs text-muted-foreground">Preview unified submission</p>
            </div>
          </Link>
        </div>

        <PlannerCalendar events={plannerEvents} />
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <RequirementTracker items={requirementItems} />
          <div className="surface-stage space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Daily brief</p>
              <p className="text-lg font-semibold text-foreground">Today&apos;s focus</p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {dailySummary.tasks} {dailySummary.tasks === 1 ? 'task' : 'tasks'} • {dailySummary.deadlines}{' '}
                {dailySummary.deadlines === 1 ? 'deadline' : 'deadlines'} • {dailySummary.interviews}{' '}
                {dailySummary.interviews === 1 ? 'interview' : 'interviews'}
              </p>
            </div>
            <ReferenceTracker references={referenceItems} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="surface-stage space-y-4 rounded-[28px]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Files</p>
              <p className="text-lg font-semibold text-foreground">Upload documents</p>
            </div>
            <DocumentUploader applicationId={appRecords[0]?.id ?? null} />
          </div>
          <SignalCenter signals={signalItems} />
          <div className="surface-stage space-y-4 rounded-[28px]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Timeline</p>
              <p className="text-lg font-semibold text-foreground">Upcoming deadlines</p>
            </div>
            <DeadlineTimeline items={timelineItems} />
          </div>
        </div>

        <section className="surface-stage space-y-4 rounded-[28px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">Just in case</p>
              <h2 className="text-2xl font-semibold text-foreground">Resources you can grab</h2>
            </div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Updated weekly</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {resourceHighlights.map((resource) => (
              <article
                key={resource.id}
                className="surface-subcard flex min-h-[180px] flex-col justify-between gap-3 transition-colors"
              >
                <div>
                  <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">{resource.tag}</p>
                  <h3 className="text-base font-semibold text-foreground">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </div>
                <Link
                  href={resource.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold uppercase tracking-[0.4em] text-muted-foreground underline-offset-4 hover:text-foreground"
                >
                  Open resource →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <div className="surface-stage rounded-[28px] p-6 text-sm text-muted-foreground">
          {appRecords.length > 0 ? (
            <ul className="space-y-2">
              {appRecords.map((app) => (
                <li key={app.id}>
                  <p className="font-semibold text-foreground">Application status</p>
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
