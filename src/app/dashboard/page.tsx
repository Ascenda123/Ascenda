import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { TaskList } from '@/components/dashboard/task-list';
import { DeadlineTimeline } from '@/components/dashboard/deadline-timeline';
import { MatchList } from '@/components/match/match-list';
import type { EnrichedMatch } from '@/components/match/match-list';
import { rankMatches, type MatchInput } from '@/lib/matching/engine';
import { DashboardOverview } from '@/components/dashboard/overview';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';

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
    supabase.from('programs').select('*').limit(10),
    supabase.from('universities').select('*'),
    supabase.from('program_requirements').select('*')
  ]);

  const checklist = (checklistResponse.data ?? []) as ChecklistRow[];
  const deadlines = (deadlinesResponse.data ?? []) as DeadlineRow[];
  const academics = academicsResponse.data ?? null;
  const preferences = preferencesResponse.data ?? null;
  const aspirations = aspirationsResponse.data ?? null;
  const programs = (programsResponse.data ?? []) as Program[];
  const universities = (universitiesResponse.data ?? []) as University[];
  const requirements = (requirementsResponse.data ?? []) as ProgramRequirement[];

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
          blockingReasons: result.blockingReasons,
          tier: result.tier
        };
      });
  }

  const completedTasks = checklist.filter((task) => task.status === 'done').length;
  const heroStats = [
    { label: 'Checklist', value: checklist.length ? `${completedTasks}/${checklist.length}` : '0', detail: 'Completed' },
    { label: 'Deadlines', value: `${deadlines.length}`, detail: 'On radar' },
    { label: 'Matches', value: matches.length ? `${matches[0].score}%` : '—', detail: matches.length ? 'Top score' : 'Update profile' }
  ];
  const heroHighlight = matches.length ? 'Matches refreshed' : 'Complete your profile';

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

      <DashboardOverview />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <TaskList
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
        <div className="lg:col-span-3">
          <div className="space-y-4 rounded-[28px] border border-border bg-card p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-colors">
            <h2 className="text-2xl font-semibold text-foreground">Recommended programs</h2>
            {matches.length > 0 ? (
              <MatchList matches={matches} />
            ) : (
              <p className="text-sm text-muted-foreground">Update your profile to receive tailored suggestions.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
