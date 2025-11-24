import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { TaskList } from '@/components/dashboard/task-list';
import { DeadlineTimeline } from '@/components/dashboard/deadline-timeline';
import { MatchList } from '@/components/match/match-list';
import type { EnrichedMatch } from '@/components/match/match-list';
import { rankMatches, type MatchInput, type Program, type University, type ProgramRequirement } from '@/lib/matching/engine';
import { DashboardOverview } from '@/components/dashboard/overview';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/stats-card';

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
  const academicsData = academicsResponse.data;
  const preferencesData = preferencesResponse.data;
  const aspirationsData = aspirationsResponse.data;

  const programsRaw = programsResponse.data ?? [];
  const universitiesRaw = universitiesResponse.data ?? [];
  const requirementsRaw = requirementsResponse.data ?? [];

  const programs: Program[] = programsRaw.map((p: any) => ({
    id: p.id,
    name: p.name,
    field: p.field,
    level: p.level,
    durationYears: p.duration_years,
    language: p.language,
    mode: p.mode,
    intakeMonths: p.intake_months,
    tuition: p.tuition,
    currency: p.currency,
    url: p.url,
    universityId: p.university_id
  }));

  const universities: University[] = universitiesRaw.map((u: any) => ({
    id: u.id,
    name: u.name,
    country: u.country,
    region: u.region,
    rankOverall: u.rank_overall,
    rankSource: u.rank_source,
    acceptanceRate: u.acceptance_rate,
    requiresTest: u.requires_test
  }));

  const requirements: ProgramRequirement[] = requirementsRaw.map((r: any) => ({
    programId: r.program_id,
    curriculum: r.curriculum,
    minGpa: r.min_gpa,
    minIbTotal: r.min_ib_total,
    minSat: r.min_sat,
    minAct: r.min_act,
    requiredSubjects: r.required_subjects,
    languageTests: r.language_tests,
    otherRequirements: r.other_requirements
  }));

  let matches: EnrichedMatch[] = [];

  if (academicsData && preferencesData && aspirationsData && programs.length > 0 && universities.length > 0) {
    const requirementMap = new Map(requirements.map((item) => [item.programId, item]));
    const universityMap = new Map(universities.map((item) => [item.id, item]));

    // Transform user profile data
    const academics = {
      curriculum: academicsData.curriculum,
      gpa: academicsData.gpa,
      ibTotal: academicsData.ib_total,
      sat: academicsData.sat,
      act: academicsData.act,
      toefl: academicsData.toefl,
      ielts: academicsData.ielts,
      subjectGrades: academicsData.subject_grades
    };

    const preferences = {
      budgetMin: preferencesData.budget_min,
      budgetMax: preferencesData.budget_max,
      aidNeeded: preferencesData.aid_needed,
      countries: preferencesData.countries,
      languages: preferencesData.languages,
      campusType: preferencesData.campus_type,
      setting: preferencesData.setting,
      size: preferencesData.size,
      programLevels: preferencesData.program_levels,
      delivery: preferencesData.delivery
    };

    const aspirations = {
      targetFields: aspirationsData.target_fields,
      jobTitles: aspirationsData.job_titles
    };

    const inputs = programs
      .map((program) => {
        const university = universityMap.get(program.universityId);
        if (!university) return null;

        return {
          academics,
          preferences,
          aspirations,
          program,
          university,
          requirement: requirementMap.get(program.id)
        } as MatchInput;
      })
      .filter((item): item is MatchInput => item !== null);

    matches = rankMatches(inputs)
      .slice(0, 3)
      .map((result) => {
        const program = programs.find((item) => item.id === result.programId)!;
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
  const heroHighlight = matches.length ? 'Matches refreshed' : 'Complete your profile';

  return (
    <DashboardShell>
      <PageHero
        eyebrow="Mission control"
        title="Welcome back"
        description="Track every checklist, deadline, and match signal in one calm dashboard. Keep momentum rolling."
        highlight={heroHighlight}
        stats={[]}
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
