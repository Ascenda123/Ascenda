import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { DeadlineTimeline } from '@/components/dashboard/deadline-timeline';
import { MatchList } from '@/components/match/match-list';
import type { EnrichedMatch } from '@/components/match/match-list';
import { rankMatches, type MatchInput, type Program, type University, type ProgramRequirement } from '@/lib/matching/engine';
import {
  buildMatchInput,
  mapAcademicsRow,
  mapAspirationsRow,
  mapPreferencesRow,
  mapProgramRow,
  mapRequirementRow,
  mapUniversityRow
} from '@/lib/matching/transform';
import { DashboardOverview } from '@/components/dashboard/overview';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/stats-card';
import { TaskListPanel } from '@/components/dashboard/task-list-panel';

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

  const { data: applications } = await supabase
    .from('applications')
    .select('id, program_id')
    .eq('profile_id', user.id);

  const applicationIds = (applications ?? []).map((app: any) => app.id);
  const applicationProgramIds = (applications ?? []).map((app: any) => app.program_id);

  const [
    checklistResponse,
    deadlinesResponse,
    academicsResponse,
    preferencesResponse,
    aspirationsResponse,
    programsResponse,
    universitiesResponse,
    requirementsResponse
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
    supabase.from('programs').select('*').limit(10),
    supabase.from('universities').select('*'),
    supabase.from('program_requirements').select('*')
  ]);

  const checklist = (checklistResponse.data ?? []) as ChecklistRow[];
  const deadlines = (deadlinesResponse.data ?? []) as DeadlineRow[];
  const academicsData = academicsResponse.data;
  const preferencesData = preferencesResponse.data;
  const aspirationsData = aspirationsResponse.data;
  const profileSectionsComplete = [academicsData, preferencesData, aspirationsData].filter(Boolean).length;
  const profileCompletionPercent = Math.round((profileSectionsComplete / 3) * 100);

  const programsRaw = programsResponse.data ?? [];
  const universitiesRaw = universitiesResponse.data ?? [];
  const requirementsRaw = requirementsResponse.data ?? [];

  const programs: Program[] = programsRaw.map(mapProgramRow);
  const universities: University[] = universitiesRaw.map(mapUniversityRow);
  const requirements: ProgramRequirement[] = requirementsRaw.map(mapRequirementRow);

  let matches: EnrichedMatch[] = [];

  if (academicsData && preferencesData && aspirationsData && programs.length > 0 && universities.length > 0) {
    const requirementMap = new Map(requirements.map((item) => [item.programId, item]));
    const universityMap = new Map(universities.map((item) => [item.id, item]));

    // Transform user profile data
    const academics = mapAcademicsRow(academicsData);
    const preferences = mapPreferencesRow(preferencesData);
    const aspirations = mapAspirationsRow(aspirationsData);

    const inputs = programs
      .map((program) => {
        const university = universityMap.get(program.universityId);
        if (!university) return null;

        return buildMatchInput({
          academics,
          preferences,
          aspirations,
          program,
          university,
          requirement: requirementMap.get(program.id)
        });
      })
      .filter((item): item is MatchInput => item !== null);

    matches = rankMatches(inputs)
      .slice(0, 3)
      .map((result) => {
        const program = programs.find((item) => item.id === result.programId)!;
        const university = universityMap.get(result.universityId)!;
        return {
          program,
          university: { ...university, requiresTest: university.requiresTest },
          score: result.score,
          breakdown: result.breakdown,
          blockingReasons: result.blockingReasons,
          tier: result.tier
        };
      });
  }

  const completedTasks = checklist.filter((task) => task.status === 'done').length;
  const heroHighlight = matches.length ? 'Matches refreshed' : 'Complete your profile';
  const heroStats = [
    { label: 'Profile', value: `${profileCompletionPercent}%`, detail: 'Ready for matches' },
    { label: 'Checklist', value: checklist.length ? `${completedTasks}/${checklist.length}` : '0', detail: 'Tasks tracked' },
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
          value={checklist.length ? `${completedTasks}/${checklist.length}` : '0'}
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

      <DashboardOverview />

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
          <div className="space-y-4 rounded-[28px] border border-border bg-card p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-colors">
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
          <div className="space-y-4 overflow-hidden rounded-[28px] border border-border bg-card p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-colors">
            <h2 className="text-2xl font-semibold text-foreground">Recommended programs</h2>
            {matches.length > 0 ? (
              <MatchList matches={matches} filtersSticky={false} />
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
