import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { DeadlineTimeline } from '@/components/dashboard/deadline-timeline';
import { MatchList } from '@/components/match/match-list';
import { loadMatchesForProfile } from '@/lib/matching/service';
import type { EnrichedMatch } from '@/lib/matching/types';
import { DashboardOverview, type OverviewPayload, type HighlightCard } from '@/components/dashboard/overview';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { TaskListPanel } from '@/components/dashboard/task-list-panel';
import type { Database } from '@/lib/types/database';
import { buildStepCompletion, ProfileRecordGroup } from '@/lib/profile/completion';
import { PROFILE_STEPS } from '@/lib/profile/steps';

type ChecklistRow = Database['public']['Tables']['application_checklist']['Row'];
type DeadlineRow = Database['public']['Tables']['deadlines']['Row'];
type ApplicationRow = Database['public']['Tables']['applications']['Row'];

export const metadata: Metadata = {
  title: 'Dashboard | Ascenda'
};

const shortDateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const formatShortDate = (value?: string | null) => {
  if (!value) return 'TBD';
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 'TBD' : shortDateFormatter.format(new Date(timestamp));
};

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayString = new Date().toDateString();

  const { data: applications } = await supabase
    .from('applications')
    .select('id, program_id')
    .eq('profile_id', user.id);

  const applicationIds = (applications ?? []).map((app) => app.id);
  const applicationProgramIds = (applications ?? []).map((app) => app.program_id);

  const [
    checklistResponse,
    deadlinesResponse,
    matchResult,
    profileResponse,
    academicsResponse,
    preferencesResponse,
    aspirationsResponse
  ] = await Promise.all([
    applicationIds.length
      ? supabase.from('application_checklist').select('*').in('application_id', applicationIds).order('due_date', { ascending: true }).limit(5)
      : Promise.resolve({ data: [] }),
    applicationProgramIds.length
      ? supabase.from('deadlines').select('*').in('program_id', applicationProgramIds).gte('deadline_date', today).order('deadline_date', { ascending: true }).limit(5)
      : Promise.resolve({ data: [] }),
    loadMatchesForProfile(supabase, user.id, { programLimit: 10, resultLimit: 3 }),
    supabase.from('profiles').select('full_name,country,time_zone').eq('id', user.id).single(),
    supabase.from('student_academics').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_preferences').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_aspirations').select('*').eq('profile_id', user.id).single()
  ]);

  const checklist = (checklistResponse.data ?? []) as ChecklistRow[];
  const deadlines = (deadlinesResponse.data ?? []) as DeadlineRow[];
  const matches: EnrichedMatch[] = matchResult.matches;

  // Profile Completion Logic
  const profileRecord = profileResponse.data;
  const academics = academicsResponse.data;
  const preferences = preferencesResponse.data;
  const aspirations = aspirationsResponse.data;

  const records: ProfileRecordGroup = {
    profile: profileRecord,
    academics: academics,
    preferences: preferences,
    aspirations: aspirations
  };

  const stepCompletion = buildStepCompletion(records);
  const completedSteps = PROFILE_STEPS.filter((step) => stepCompletion[step.key]).length;
  const completionPercent = Math.round((completedSteps / PROFILE_STEPS.length) * 100);
  const nextStep = PROFILE_STEPS.find((step) => !stepCompletion[step.key]);

  // Derived Overview Data
  const openTasks = checklist.filter((task) => task.status !== 'done').length;
  const now = Date.now();
  const dueSoonCount = checklist.filter((task) => {
    if (!task.due_date) return false;
    const dueTime = Date.parse(task.due_date);
    return !Number.isNaN(dueTime) && dueTime >= now && dueTime <= now + 1000 * 60 * 60 * 24 * 7;
  }).length;

  const nextDeadline = deadlines[0] ?? null;
  const averageMatchScore = matches.length
    ? Math.round(matches.reduce((total, item) => total + item.score, 0) / matches.length)
    : null;

  const isSameToday = (value?: string | null) => {
    if (!value) return false;
    const timestamp = Date.parse(value);
    return !Number.isNaN(timestamp) && new Date(timestamp).toDateString() === todayString;
  };

  const todayFocus = {
    tasks: checklist.filter((task) => isSameToday(task.due_date)).length,
    deadlines: deadlines.filter((deadline) => isSameToday(deadline.deadline_date)).length,
    interviews: checklist.filter((task) => isSameToday(task.due_date) && /interview/i.test(task.task_name ?? '')).length
  };

  const dueTodayTasks = checklist.filter((task) => task.status !== 'done' && isSameToday(task.due_date));
  const dueTodayDeadlines = deadlines.filter((deadline) => isSameToday(deadline.deadline_date));
  const trackedProgramsCount = applicationProgramIds.length;

  const focusItems = [];
  const urgentTask = dueTodayTasks[0];
  if (urgentTask) {
    focusItems.push({
      id: urgentTask.id,
      label: 'Due today',
      title: urgentTask.task_name ?? 'Checklist task',
      detail: 'Close this out to stay on track.'
    });
  }
  const urgentDeadline = dueTodayDeadlines[0] ?? deadlines[0];
  if (urgentDeadline) {
    focusItems.push({
      id: urgentDeadline.id,
      label: 'Milestone',
      title: urgentDeadline.name ?? 'Application milestone',
      detail: urgentDeadline.deadline_date ? `Due ${formatShortDate(urgentDeadline.deadline_date)}` : 'Date TBC'
    });
  }
  const nextTask = checklist.find((task) => task.status !== 'done');
  if (nextTask) {
    focusItems.push({
      id: nextTask.id,
      label: 'Checklist',
      title: nextTask.task_name ?? 'Checklist task',
      detail: nextTask.due_date ? `Due ${formatShortDate(nextTask.due_date)}` : 'No due date'
    });
  }
  const blockerMatch = matches.find((match) => match.blockingReasons.length > 0);
  if (blockerMatch) {
    focusItems.push({
      id: `blocker-${blockerMatch.program.id}`,
      label: 'Eligibility flag',
      title: blockerMatch.program.name,
      detail: blockerMatch.blockingReasons[0]
    });
  }
  if (nextStep) {
    focusItems.push({
      id: 'focus-profile',
      label: 'Profile',
      title: nextStep.title,
      detail: 'Add these details to unlock richer recommendations.'
    });
  }
  if (focusItems.length === 0) {
    focusItems.push({
      id: 'focus-clear',
      label: 'Systems check',
      title: 'You are on track',
      detail: 'Keep logging progress or add programs to surface new actions.'
    });
  }

  const primaryFocus = focusItems[0];

  const highlightCards: HighlightCard[] = [
    {
      id: 'priority',
      label: 'Next priority',
      value: primaryFocus ? primaryFocus.title : 'All clear',
      detail: primaryFocus ? primaryFocus.detail : 'Log progress or add programs to surface new actions.',
      tone: primaryFocus && primaryFocus.label === 'Due today' ? 'warning' : !primaryFocus ? 'positive' : undefined
    },
    {
      id: 'profile',
      label: 'Profile readiness',
      value: `${completionPercent}%`,
      detail: nextStep ? `${nextStep.title} needs attention` : 'All sections complete',
      tone: completionPercent === 100 ? 'positive' : undefined
    }
  ];

  const overviewPayload: OverviewPayload = {
    highlightCards,
    focusItems,
    nextStepTitle: nextStep?.title ?? null
  };

  const heroHighlight = primaryFocus ? primaryFocus.label : 'Systems steady';
  const heroStats = [
    { label: 'Due today', value: todayFocus.tasks > 0 ? `${todayFocus.tasks}` : '0', detail: dueSoonCount > 0 ? `${dueSoonCount} due this week` : 'Nothing urgent' },
    { label: 'Deadlines', value: deadlines.length > 0 ? `${deadlines.length}` : '0', detail: nextDeadline ? `Next: ${formatShortDate(nextDeadline.deadline_date)}` : 'Add a program to track milestones' },
    { label: 'Match health', value: averageMatchScore !== null ? `${averageMatchScore}%` : '-', detail: matches.length ? `${matches[0].program.name}` : 'Finish profile to unlock' }
  ];

  return (
    <DashboardShell>
      <PageHero
        eyebrow="Mission control"
        title="Command center"
        description="Only the signals that matter: what needs you now, what's next on the roadmap, and where your profile can unlock better matches."
        highlight={heroHighlight}
        stats={heroStats}
        actions={
          <>
            <Button asChild size="sm">
              <Link href="/university-search/search">Open university search</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href="/matches">Review matches</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/profile">Update profile</Link>
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        <DashboardOverview data={overviewPayload} />

        {deadlines.length > 0 ? (
          <div className="surface-card surface-card--static space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Upcoming deadlines</h2>
            <DeadlineTimeline
              items={deadlines.map((deadline) => ({
                id: deadline.id,
                name: deadline.name,
                date: deadline.deadline_date ?? 'TBD',
                context: deadline.intake ?? 'Application period'
              }))}
            />
          </div>
        ) : null}

        <TaskListPanel
          title="Application checklist"
          tasks={checklist.map((item) => ({
            id: item.id,
            name: item.task_name,
            status: item.status,
            dueDate: item.due_date ?? undefined
          }))}
        />

        <div className="surface-card surface-card--static space-y-4 overflow-hidden">
          <h2 className="text-2xl font-semibold text-foreground">Recommended programs</h2>
          {matches.length > 0 ? (
            <MatchList matches={matches} />
          ) : (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="text-base font-semibold text-foreground">No recommendations yet</p>
              <p>Complete your profile and add preferred destinations to see personalized matches.</p>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link href="/profile">Finish profile</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/matches">See all matches</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
