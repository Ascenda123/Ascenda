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
import { StatsCard } from '@/components/dashboard/stats-card';
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

  const applicationIds = (applications ?? []).map((app: ApplicationRow) => app.id);
  const applicationProgramIds = (applications ?? []).map((app: ApplicationRow) => app.program_id);

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
  const completedTasksCount = checklist.filter((task) => task.status === 'done').length;

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

  const highlightCards: HighlightCard[] = [
    {
      id: 'profile',
      label: 'Profile readiness',
      value: `${completionPercent}%`,
      detail: nextStep ? `${nextStep.title} needs attention` : 'All sections complete',
      tone: completionPercent === 100 ? 'positive' : undefined
    },
    {
      id: 'tasks',
      label: 'Checklist',
      value: openTasks > 0 ? `${openTasks} open` : 'All clear',
      detail: dueSoonCount > 0 ? `${dueSoonCount} due this week` : 'No deadlines in the next 7 days',
      tone: openTasks === 0 ? 'positive' : dueSoonCount > 0 ? 'warning' : undefined
    },
    {
      id: 'deadline',
      label: 'Next deadline',
      value: nextDeadline ? formatShortDate(nextDeadline.deadline_date) : 'TBD',
      detail: nextDeadline ? nextDeadline.name : 'Track a program to unlock deadlines',
      tone: nextDeadline ? undefined : 'muted'
    },
    {
      id: 'matches',
      label: 'Match momentum',
      value: matches.length > 0 ? `${matches[0].score}%` : 'Profile first',
      detail:
        matches.length > 0
          ? `${matches[0].program.name} • ${matches[0].university.name}`
          : 'Update your profile to unlock matches',
      tone: matches.length > 0 && matches[0].score >= 80 ? 'positive' : undefined
    }
  ];

  const focusItems = [];
  if (nextStep) {
    focusItems.push({
      id: 'focus-profile',
      label: 'Profile',
      title: nextStep.title,
      detail: 'Add these details to unlock richer recommendations.'
    });
  }
  const nextTask = checklist.find((task) => task.status !== 'done');
  if (nextTask) {
    focusItems.push({
      id: nextTask.id,
      label: 'Checklist',
      title: nextTask.task_name,
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
  } else if (nextDeadline) {
    focusItems.push({
      id: 'focus-deadline',
      label: 'Milestone',
      title: nextDeadline.name,
      detail: `Due ${formatShortDate(nextDeadline.deadline_date)}`
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

  const steps = PROFILE_STEPS.map((step) => ({
    key: step.key,
    title: step.title,
    description: step.description,
    complete: stepCompletion[step.key]
  }));

  const overviewPayload: OverviewPayload = {
    highlightCards,
    focusItems,
    steps,
    completionPercent,
    completedSteps,
    averageMatchScore,
    nextStepTitle: nextStep?.title ?? null,
    todayFocus
  };

  const heroHighlight = matches.length ? 'Matches refreshed' : 'Complete your profile';
  const heroStats = [
    { label: 'Profile', value: `${completionPercent}%`, detail: 'Ready for matches' },
    { label: 'Checklist', value: checklist.length ? `${completedTasksCount}/${checklist.length}` : '0', detail: 'Tasks tracked' },
    { label: 'Signals', value: matches.length ? `${matches[0].score}%` : '—', detail: matches.length ? 'Top fit' : 'Profile first' }
  ];

  return (
    <DashboardShell>
      <PageHero
        eyebrow="Mission control"
        title="Welcome back"
        description="Track every checklist, deadline, and match signal in one calm dashboard. Keep momentum rolling."
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

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard
          label="Checklist"
          value={checklist.length ? `${completedTasksCount}/${checklist.length}` : '0'}
          detail="Tasks completed"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>}
        />
        <StatsCard
          label="Deadlines"
          value={`${deadlines.length}`}
          detail="Upcoming on radar"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
        />
        <StatsCard
          label="Top Match"
          value={matches.length ? `${matches[0].score}%` : '—'}
          detail={matches.length ? 'Highest fit score' : 'Update profile'}
          trend={matches.length ? 'up' : 'neutral'}
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" /><path d="M8.5 8.5v.01" /><path d="M16 16v.01" /><path d="M12 12v.01" /></svg>}
        />
      </div>

      <DashboardOverview data={overviewPayload} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <TaskListPanel
            title="Application checklist"
            tasks={checklist.map((item) => ({
              id: item.id,
              name: item.task_name,
              status: item.status,
              dueDate: item.due_date ?? undefined
            }))}
          />
        </div>
        <aside className="space-y-6">
          <div className="glass-panel space-y-4 rounded-[28px] p-6 transition-colors">
            <h2 className="text-2xl font-semibold text-foreground">Upcoming deadlines</h2>
            {deadlines.length > 0 ? (
              <DeadlineTimeline
                items={deadlines.map((deadline) => ({
                  id: deadline.id,
                  name: deadline.name,
                  date: deadline.deadline_date ?? 'TBD',
                  context: deadline.intake ?? 'Application period'
                }))}
              />
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming deadlines yet—track a program to surface milestones.</p>
            )}
          </div>
        </aside>
        <div className="lg:col-span-3">
          <div className="glass-panel space-y-4 overflow-hidden rounded-[28px] p-6 transition-colors">
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
      </div>
    </DashboardShell>
  );
}
