import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { PROFILE_STEPS, type StepKey } from '@/lib/profile/steps';
import { buildStepCompletion } from '@/lib/profile/completion';
import { rankMatches, type MatchInput } from '@/lib/matching/engine';
import {
  buildMatchInput,
  mapAcademicsRow,
  mapAspirationsRow,
  mapPreferencesRow,
  mapProgramRow,
  mapRequirementRow,
  mapUniversityRow
} from '@/lib/matching/transform';
import type { EnrichedMatch } from '@/lib/matching/types';
import type { Database } from '@/lib/types/database';
import { filterVisiblePrograms } from '@/lib/catalog/visibility';

type ApplicationRow = Database['public']['Tables']['applications']['Row'];
type ChecklistRow = Database['public']['Tables']['application_checklist']['Row'];
type DeadlineRow = Database['public']['Tables']['deadlines']['Row'];
type AcademicsRow = Database['public']['Tables']['student_academics']['Row'];
type PreferencesRow = Database['public']['Tables']['student_preferences']['Row'];
type AspirationsRow = Database['public']['Tables']['student_aspirations']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProgramRow = Database['public']['Tables']['programs']['Row'];
type UniversityRow = Database['public']['Tables']['universities']['Row'];
type ProgramRequirementRow = Database['public']['Tables']['program_requirements']['Row'];

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

  const { data: applications } = await supabase
    .from('applications')
    .select('id, program_id')
    .eq('profile_id', user.id);

  const applicationIds = (applications ?? []).map((app) => app.id);
  const applicationProgramIds = (applications ?? []).map((app) => app.program_id);

  const [
    checklistResponse,
    deadlinesResponse,
    academicsResponse,
    preferencesResponse,
    aspirationsResponse,
    profileResponse,
    programsResponse
  ] = await Promise.all([
    applicationIds.length
      ? supabase.from('application_checklist').select('*').in('application_id', applicationIds).order('due_date', { ascending: true }).limit(5)
      : Promise.resolve({ data: [] }),
    applicationProgramIds.length
      ? supabase
        .from('deadlines')
        .select('*')
        .in('program_id', applicationProgramIds)
        .gte('deadline_date', today)
        .order('deadline_date', { ascending: true })
        .limit(5)
      : Promise.resolve({ data: [] }),
    supabase.from('student_academics').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_preferences').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_aspirations').select('*').eq('profile_id', user.id).single(),
    supabase.from('profiles').select('full_name,country,time_zone').eq('id', user.id).single(),
    applicationProgramIds.length
      ? supabase.from('programs').select('*').in('id', applicationProgramIds).limit(25)
      : supabase.from('programs').select('*').limit(25)
  ]);

  const checklist = (checklistResponse.data ?? []) as ChecklistRow[];
  const deadlines = (deadlinesResponse.data ?? []) as DeadlineRow[];
  const academics = academicsResponse.data ?? null;
  const preferences = preferencesResponse.data ?? null;
  const aspirations = aspirationsResponse.data ?? null;
  const profileRecord = (profileResponse.data ?? null) as ProfileRow | null;
  const normalizeMetadata = (value: unknown): Record<string, unknown> | null => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    return null;
  };

  const programs = (programsResponse.data ?? []) as ProgramRow[];
  if (programs.length === 0 && applicationProgramIds.length === 0) {
    // Fallback to a small curated sample to avoid empty dashboard while keeping payload tiny.
    const fallbackProgramsResponse = await supabase.from('programs').select('*').limit(8);
    if (!fallbackProgramsResponse.error) {
      programs.push(
        ...((fallbackProgramsResponse.data ?? []) as ProgramRow[]).map((program) => ({
          ...program,
          metadata: normalizeMetadata(program.metadata)
        }))
      );
    }
  }
  const normalizedPrograms = programs.map((program) => ({
    ...program,
    metadata: normalizeMetadata(program.metadata)
  }));
  const visiblePrograms = filterVisiblePrograms(normalizedPrograms);
  const programIds = visiblePrograms.map((program) => program.id);
  const universityIds = visiblePrograms.map((program) => program.university_id);

  const filteredUniversitiesResponse =
    universityIds.length > 0
      ? await supabase
        .from('universities')
        .select('id,name,country,region,rank_overall,rank_source,acceptance_rate,requires_test,metadata')
        .in('id', universityIds)
      : { data: [] };

  const filteredRequirementsResponse =
    programIds.length > 0
      ? await supabase
        .from('program_requirements')
        .select(
          'program_id,curriculum,min_gpa,min_ib_total,min_sat,min_act,required_subjects,language_tests,other_requirements'
        )
        .in('program_id', programIds)
      : { data: [] };

  const universities = (filteredUniversitiesResponse.data ?? []) as UniversityRow[];
  const requirements = (filteredRequirementsResponse.data ?? []) as ProgramRequirementRow[];

  let matchResults = [] as Awaited<ReturnType<typeof rankMatches>>;
  let mappedPrograms = new Map<string, ReturnType<typeof mapProgramRow>>();
  let mappedUniversities = new Map<string, ReturnType<typeof mapUniversityRow>>();
  if (academics && preferences && aspirations && visiblePrograms.length > 0 && universities.length > 0) {
    const mappedAcademics = mapAcademicsRow(academics);
    const mappedPreferences = mapPreferencesRow(preferences);
    const mappedAspirations = mapAspirationsRow(aspirations);
    const requirementMap = new Map<string, ReturnType<typeof mapRequirementRow>>(
      requirements.map((item) => [item.program_id, mapRequirementRow(item)])
    );
    mappedPrograms = new Map(visiblePrograms.map((program) => [program.id, mapProgramRow(program)]));
    mappedUniversities = new Map(universities.map((item) => [item.id, mapUniversityRow(item)]));
    const inputs = visiblePrograms
      .map((program) => {
        const mappedProgram = mappedPrograms.get(program.id);
        const mappedUniversity = mappedUniversities.get(program.university_id);
        if (!mappedProgram || !mappedUniversity) return null;
        return buildMatchInput({
          academics: mappedAcademics,
          preferences: mappedPreferences,
          aspirations: mappedAspirations,
          program: mappedProgram,
          university: mappedUniversity,
          requirement: requirementMap.get(program.id)
        });
      })
      .filter((value: MatchInput | null): value is MatchInput => value !== null);

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

  const enrichedMatches = matchResults.reduce<EnrichedMatch[]>((acc, result) => {
    const program = mappedPrograms.get(result.programId);
    const university = mappedUniversities.get(result.universityId);
    if (!program || !university) return acc;
    acc.push({
      program,
      university,
      score: result.score,
      breakdown: result.breakdown,
      blockingReasons: result.blockingReasons,
      tier: result.tier
    });
    return acc;
  }, []);

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
