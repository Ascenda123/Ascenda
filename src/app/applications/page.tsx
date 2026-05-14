import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { DeadlineTimeline } from '@/components/dashboard/deadline-timeline';
import { DocumentUploader } from '@/components/applications/document-uploader';
import { type PriorityItem } from '@/components/applications/application-priority-board';
import { PriorityBoardWithHelp } from '@/components/applications/priority-board-with-help';
import { RequirementTracker, type RequirementItem } from '@/components/applications/requirement-tracker';
import dynamic from 'next/dynamic';
const PlannerCalendar = dynamic(
  () => import('@/components/applications/planner-calendar').then((m) => m.PlannerCalendar),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-border bg-muted/20 text-sm text-muted-foreground">
        Loading calendar…
      </div>
    ),
  }
);
type PlannerEvent = import('@/components/applications/planner-calendar').PlannerEvent;
import { ReferenceTracker, type ReferenceItem } from '@/components/applications/reference-tracker';
import { SignalCenter, type SignalItem } from '@/components/applications/signal-center';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { SectionNav } from '@/components/layout/section-nav';
import { PLANNER_SECTION_ITEMS } from '@/components/layout/navigation';
import { EmptyState } from '@/components/ui/empty-state';
import { ClipboardCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Applications'
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
          tone="student"
          eyebrow="Your applications"
          title="Let's get your first one in motion"
          description="Pick a program from your shortlist and we'll set up the tasks, deadlines, and docs for you."
          highlight="Nothing tracked yet"
          accent="Ready when you are"
          stats={[
            { label: 'Applications', value: '0', detail: 'Tracked' },
            { label: 'Deadlines', value: '—', detail: 'Awaiting programs' },
            { label: 'Updates', value: '—', detail: 'Add programs first' }
          ]}
          breadcrumbs={<Breadcrumbs />}
          actions={
            <Button asChild size="sm">
              <Link href="/university-search/shortlist">Add from shortlist</Link>
            </Button>
          }
        />
        <EmptyState
          icon={ClipboardCheck}
          title="No applications yet — let's pick a first one"
          description="Add a program from your shortlist and we'll line up the tasks, deadlines, and documents for you."
          action={
            <Button asChild size="sm">
              <Link href="/university-search/shortlist">Add from shortlist</Link>
            </Button>
          }
          hint="Don't have a shortlist yet? Browse your matches instead."
        />
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
    { label: 'Updates', value: `${signalItems.length}`, detail: 'Latest activity' }
  ];

  return (
    <DashboardShell>
      <SectionNav items={PLANNER_SECTION_ITEMS} />
      <PageHero
        tone="student"
        eyebrow="Your applications"
        title="Where everything's at"
        description="Tasks, deadlines, docs, references — your whole application picture in one spot."
        highlight={`Today · ${dailySummary.tasks} tasks, ${dailySummary.deadlines} deadlines`}
        accent="Today"
        stats={heroStats}
        breadcrumbs={<Breadcrumbs />}
        actions={
          <>
            <Button asChild size="sm">
              <Link href="/university-search/shortlist">Add from shortlist</Link>
            </Button>
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

      <div className="space-y-6 sm:space-y-8">
        {/* Priority — what to focus on this week */}
        <PriorityBoardWithHelp items={priorityItems} />

        {/* Now — what's open right now (tasks, deadlines, updates) */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Now</p>
              <h2 className="text-2xl font-semibold text-foreground">Today&apos;s focus</h2>
              <p className="text-sm text-muted-foreground">
                {dailySummary.tasks} {dailySummary.tasks === 1 ? 'task' : 'tasks'} ·{' '}
                {dailySummary.deadlines} {dailySummary.deadlines === 1 ? 'deadline' : 'deadlines'} ·{' '}
                {dailySummary.interviews} {dailySummary.interviews === 1 ? 'interview' : 'interviews'}
              </p>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link href="/applications/tasks">Open task board →</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 sm:gap-6">
            <RequirementTracker items={requirementItems} />
            <div className="space-y-4">
              <div className="surface-stage space-y-4 rounded-[28px]">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Timeline</p>
                  <p className="text-lg font-semibold text-foreground">Upcoming deadlines</p>
                </div>
                <DeadlineTimeline items={timelineItems} />
              </div>
              <SignalCenter signals={signalItems} />
            </div>
          </div>
        </section>

        {/* Resources — quieter row: calendar, files, references */}
        <section className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Resources</p>
            <h2 className="text-2xl font-semibold text-foreground">Calendar, files, and references</h2>
            <p className="text-sm text-muted-foreground">Drop in anything you want to keep handy across applications.</p>
          </div>
          <PlannerCalendar events={plannerEvents} />
          <div className="grid gap-4 md:grid-cols-2 sm:gap-6">
            <div className="surface-stage space-y-4 rounded-[28px]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Files</p>
                <p className="text-lg font-semibold text-foreground">Upload documents</p>
              </div>
              <DocumentUploader applicationId={appRecords[0]?.id ?? null} />
            </div>
            <div className="surface-stage space-y-4 rounded-[28px]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">References</p>
                <p className="text-lg font-semibold text-foreground">Recommenders</p>
              </div>
              <ReferenceTracker references={referenceItems} />
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
