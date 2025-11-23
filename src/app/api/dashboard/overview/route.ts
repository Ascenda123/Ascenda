import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { PROFILE_STEPS, type StepKey } from '@/lib/profile/steps';
import { buildStepCompletion } from '@/lib/profile/completion';
import { rankMatches, type MatchInput } from '@/lib/matching/engine';
import type { EnrichedMatch } from '@/components/match/match-list';

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

export async function GET() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

  let matchResults = [] as Awaited<ReturnType<typeof rankMatches>>;
  if (academics && preferences && aspirations && programs.length > 0 && universities.length > 0) {
    const requirementMap = new Map(requirements.map((item: any) => [item.program_id, item]));
    const universityMap = new Map(universities.map((item: any) => [item.id, item]));
    const inputs = programs
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
        } as MatchInput;
      })
      .filter((value: any) => value !== null) as MatchInput[];

    matchResults = rankMatches(inputs).slice(0, 3);
  }

  const openTasks = checklist.filter((task) => task.status !== 'done').length;
  const now = Date.now();
  const dueSoonCount = checklist.filter((task) => {
    if (!task.due_date) return false;
    const dueTime = Date.parse(task.due_date);
    return !Number.isNaN(dueTime) && dueTime >= now && dueTime <= now + 1000 * 60 * 60 * 24 * 7;
  }).length;

  const nextDeadline = deadlines[0] ?? null;

  const enrichedMatches: EnrichedMatch[] = matchResults
    .map((result) => {
      const program = programs.find((item: any) => item.id === result.programId);
      const university = universities.find((item: any) => item.id === result.universityId);
      if (!program || !university) return null;
      return {
        program,
        university,
        score: result.score,
        breakdown: result.breakdown,
        blockingReasons: result.blockingReasons,
        tier: result.tier
      };
    })
    .filter((entry): entry is EnrichedMatch => entry !== null);

  const averageMatchScore = enrichedMatches.length
    ? Math.round(enrichedMatches.reduce((total, item) => total + item.score, 0) / enrichedMatches.length)
    : null;

  const stepCompletion = buildStepCompletion({
    profile: profileRecord,
    academics,
    preferences,
    aspirations
  });
  const completedSteps = PROFILE_STEPS.filter((step) => stepCompletion[step.key]).length;
  const completionPercent = Math.round((completedSteps / PROFILE_STEPS.length) * 100);
  const nextStep = PROFILE_STEPS.find((step) => !stepCompletion[step.key]);

  const todayString = new Date().toDateString();
  const isSameToday = (value?: string | null) => {
    if (!value) return false;
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) {
      return false;
    }
    return new Date(timestamp).toDateString() === todayString;
  };

  const dailySummary = {
    tasks: checklist.filter((task) => isSameToday(task.due_date)).length,
    deadlines: deadlines.filter((deadline) => isSameToday(deadline.deadline_date)).length,
    interviews: checklist.filter(
      (task) => isSameToday(task.due_date) && /interview/i.test(task.task_name ?? '')
    ).length
  };

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
      value: enrichedMatches.length > 0 ? `${enrichedMatches[0].score}%` : 'Profile first',
      detail:
        enrichedMatches.length > 0
          ? `${enrichedMatches[0].program.name} • ${enrichedMatches[0].university.name}`
          : 'Update your profile to unlock matches',
      tone: enrichedMatches.length > 0 && enrichedMatches[0].score >= 80 ? 'positive' : undefined
    }
  ] as const;

  const focusItems: { id: string; label: string; title: string; detail: string }[] = [];
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

  const blockerMatch = enrichedMatches.find((match) => match.blockingReasons.length > 0);

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

  return NextResponse.json(
    {
      highlightCards,
      focusItems,
      completionPercent,
      completedSteps,
      steps,
      averageMatchScore,
      nextStepTitle: nextStep?.title ?? null,
      todayFocus: dailySummary
    },
    {
      headers: {
        'Cache-Control': 'no-store'
      }
    }
  );
}
