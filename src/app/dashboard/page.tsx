import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { TaskList } from '@/components/dashboard/task-list';
import { DeadlineTimeline } from '@/components/dashboard/deadline-timeline';
import { MatchList } from '@/components/match/match-list';
import type { EnrichedMatch } from '@/components/match/match-list';
import { rankMatches, type MatchInput } from '@/lib/matching/engine';
import { PROFILE_STEPS, type StepKey } from '@/app/profile/constants';

interface ChecklistRow {
  id: string;
  task_name: string;
  status: 'todo' | 'doing' | 'done';
  due_date?: string | null;
}

interface DeadlineRow {
  id: string;
  name: string;
  deadline_date?: string | null;
  intake?: string | null;
}

interface ProfileRow {
  full_name?: string | null;
  country?: string | null;
  time_zone?: string | null;
}

interface FocusItem {
  id: string;
  label: string;
  title: string;
  detail: string;
}

const shortDateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

const formatShortDate = (value?: string | null) => {
  if (!value) {
    return 'TBD';
  }
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return 'TBD';
  }
  return shortDateFormatter.format(new Date(timestamp));
};

const computeStepCompletion = (
  profile: ProfileRow | null,
  academics: Record<string, any> | null,
  preferences: Record<string, any> | null,
  aspirations: Record<string, any> | null
): Record<StepKey, boolean> => ({
  personal: Boolean(profile?.full_name && profile?.country && profile?.time_zone),
  academics: Boolean(academics?.curriculum),
  preferences: Boolean((preferences?.countries ?? []).length),
  aspirations: Boolean((aspirations?.target_fields ?? []).length)
});

export const metadata: Metadata = {
  title: 'Dashboard | Ascenda'
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

  const [
    checklistResponse,
    deadlinesResponse,
    academicsResponse,
    preferencesResponse,
    aspirationsResponse,
    profileResponse,
    programsResponse,
    universitiesResponse,
    requirementsResponse
  ] = await Promise.all([
    supabase.from('application_checklist').select('*').order('due_date', { ascending: true }).limit(5),
    supabase
      .from('deadlines')
      .select('*')
      .gte('deadline_date', today)
      .order('deadline_date', { ascending: true })
      .limit(5),
    supabase.from('student_academics').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_preferences').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_aspirations').select('*').eq('profile_id', user.id).single(),
    supabase.from('profiles').select('full_name,country,time_zone').eq('id', user.id).single(),
    supabase.from('programs').select('*').limit(10),
    supabase.from('universities').select('*'),
    supabase.from('program_requirements').select('*')
  ]);

  const checklist = (checklistResponse.data ?? []) as ChecklistRow[];
  const deadlines = (deadlinesResponse.data ?? []) as DeadlineRow[];
  const academics = academicsResponse.data ?? null;
  const preferences = preferencesResponse.data ?? null;
  const aspirations = aspirationsResponse.data ?? null;
  const profileRecord = (profileResponse.data ?? null) as ProfileRow | null;
  const programs = programsResponse.data ?? [];
  const universities = universitiesResponse.data ?? [];
  const requirements = requirementsResponse.data ?? [];

  let matches: EnrichedMatch[] = [];

  if (academics && preferences && aspirations && programs.length > 0 && universities.length > 0) {
    const requirementMap = new Map(requirements.map((item: any) => [item.program_id, item]));
    const universityMap = new Map(universities.map((item: any) => [item.id, item]));
    const inputs: MatchInput[] = programs
      .map((program: any) => {
        const university = universityMap.get(program.university_id);
        if (!university) return null;
        return {
          academics,
          preferences,
          aspirations,
          program,
          university,
          requirement: requirementMap.get(program.id) ?? undefined
        } satisfies MatchInput;
      })
      .filter((value): value is MatchInput => value !== null);

    matches = rankMatches(inputs)
      .slice(0, 3)
      .map((result) => {
        const program = programs.find((item: any) => item.id === result.programId)!;
        const university = universityMap.get(result.universityId)!;
        return {
          program,
          university,
          score: result.score,
          breakdown: result.breakdown,
          blockingReasons: result.blockingReasons
        };
      });
  }

  const stepCompletion = computeStepCompletion(profileRecord, academics, preferences, aspirations);
  const completedSteps = PROFILE_STEPS.filter((step) => stepCompletion[step.key]).length;
  const completionPercent = Math.round((completedSteps / PROFILE_STEPS.length) * 100);
  const nextStep = PROFILE_STEPS.find((step) => !stepCompletion[step.key]);

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

  const highlightCards = [
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
  ] as const;

  const focusItems: FocusItem[] = [];
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

  return (
    <DashboardShell>
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-500">Your mission control for applications, deadlines, and match insights.</p>
      </section>

      <section className="space-y-6 rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Overview</p>
            <h2 className="text-2xl font-semibold text-slate-900">Readiness snapshot</h2>
          </div>
          <p className="text-sm text-slate-500">
            {nextStep ? `${nextStep.title} is the next best action.` : 'Everything is synced—keep momentum going.'}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {highlightCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-2xl border p-4 ${
                card.tone === 'positive'
                  ? 'border-emerald-200 bg-emerald-50/60'
                  : card.tone === 'warning'
                    ? 'border-amber-200 bg-amber-50/60'
                    : card.tone === 'muted'
                      ? 'border-slate-100 bg-slate-50/80'
                      : 'border-slate-100 bg-slate-50/40'
              }`}
            >
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{card.value}</p>
              <p className="text-sm text-slate-600">{card.detail}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
          <div className="rounded-[24px] border border-slate-100 bg-white/80 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Profile completion</p>
                <p className="text-3xl font-semibold text-slate-900">{completionPercent}%</p>
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {completedSteps} / {PROFILE_STEPS.length} steps
              </p>
            </div>
            <div className="mt-4 h-2 rounded-full bg-slate-100" aria-hidden>
              <div className="h-2 rounded-full bg-slate-900 transition-all" style={{ width: `${completionPercent}%` }} />
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {PROFILE_STEPS.map((step) => {
                const complete = stepCompletion[step.key];
                return (
                  <div
                    key={step.key}
                    className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 shadow-[0_12px_25px_rgba(15,23,42,0.04)]"
                  >
                    <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                    <p className="text-xs text-slate-500">{step.description}</p>
                    <p className={complete ? 'mt-3 text-sm font-semibold text-emerald-600' : 'mt-3 text-sm font-semibold text-amber-600'}>
                      {complete ? 'Complete' : 'Action needed'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-[24px] border border-slate-100 bg-white/80 p-5">
            <p className="text-sm font-semibold text-slate-900">Focus radar</p>
            <p className="text-xs text-slate-500">Signals that need your attention right now.</p>
            <ul className="mt-4 space-y-4">
              {focusItems.map((item) => (
                <li key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
                  <p className="text-base font-semibold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-600">{item.detail}</p>
                </li>
              ))}
            </ul>
            {averageMatchScore !== null ? (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Average match score</p>
                <p className="text-2xl font-semibold text-slate-900">{averageMatchScore}%</p>
                <p>Top programs stay above 80%. Keep refining your profile to lift the average.</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <TaskList
            title="Application checklist"
            tasks={checklist.map((item) => ({
              id: item.id,
              name: item.task_name,
              status: item.status,
              dueDate: item.due_date ?? undefined
            }))}
          />
          <div className="space-y-4 rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <h2 className="text-2xl font-semibold text-slate-900">Recommended programs</h2>
            {matches.length > 0 ? (
              <MatchList matches={matches} />
            ) : (
              <p className="text-sm text-slate-500">Update your profile to receive tailored suggestions.</p>
            )}
          </div>
        </div>
        <aside className="space-y-6">
          <div className="space-y-4 rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <h2 className="text-2xl font-semibold text-slate-900">Upcoming deadlines</h2>
            <DeadlineTimeline
              items={deadlines.map((deadline) => ({
                id: deadline.id,
                name: deadline.name,
                date: deadline.deadline_date ?? 'TBD',
                context: deadline.intake ?? 'Application period'
              }))}
            />
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
