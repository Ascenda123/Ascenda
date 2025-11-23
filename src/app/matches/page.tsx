import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { rankMatches, type MatchInput, type Program, type University, type ProgramRequirement } from '@/lib/matching/engine';
import { MatchList } from '@/components/match/match-list';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Match suggestions | Ascenda'
};

export default async function MatchesPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [{ data: academicsData }, { data: preferencesData }, { data: aspirationsData }] = await Promise.all([
    supabase.from('student_academics').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_preferences').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_aspirations').select('*').eq('profile_id', user.id).single()
  ]);

  const academics = academicsData as unknown as MatchInput['academics'];
  const preferences = preferencesData as unknown as MatchInput['preferences'];
  const aspirations = aspirationsData as unknown as MatchInput['aspirations'];

  if (!academics || !preferences || !aspirations) {
    return (
      <DashboardShell>
        <PageHero
          eyebrow="Matches"
          title="Dial in your Fit Score"
          description="Complete your profile to unlock personalized program rankings, tuition filters, and signal tracking."
          highlight="Profile info missing"
          stats={[{ label: 'Matches', value: '—' }, { label: 'Programs', value: '0' }, { label: 'Signals', value: '—' }]}
          actions={
            <Button asChild size="sm">
              <Link href="/profile">Finish profile</Link>
            </Button>
          }
        />
        <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
          Complete your profile to receive personalized matches.
        </div>
      </DashboardShell>
    );
  }

  const [{ data: programsData }, { data: universitiesData }, { data: requirementsData }] = await Promise.all([
    supabase.from('programs').select('*'),
    supabase.from('universities').select('*'),
    supabase.from('program_requirements').select('*')
  ]);

  const programs = programsData as unknown as Program[];
  const universities = universitiesData as unknown as University[];
  const requirements = requirementsData as unknown as ProgramRequirement[];

  if (!programs || !universities) {
    return (
      <DashboardShell>
        <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
          We could not load the program catalog yet. Please check back later.
        </div>
      </DashboardShell>
    );
  }

  const requirementMap = new Map(requirements?.map((item) => [item.program_id, item]) ?? []);
  const universityMap = new Map(universities.map((item) => [item.id, item]));

  const inputs: MatchInput[] = programs
    .map((program) => {
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
    .filter((value): value is MatchInput => value !== null);

  const results = rankMatches(inputs);
  const enriched = results.map((result) => {
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

  const heroStats = [
    { label: 'Programs', value: `${programs.length}`, detail: 'in catalog' },
    { label: 'Live matches', value: `${enriched.length}`, detail: 'Ranked for you' },
    { label: 'Top fit', value: enriched[0] ? `${enriched[0].score}%` : '—', detail: 'Highest score' }
  ];

  return (
    <DashboardShell>
      <PageHero
        eyebrow="Matches"
        title="Match suggestions"
        description="Ranked by eligibility, academic alignment, preferences, and outcome indicators."
        highlight="Signals watchlist"
        stats={heroStats}
        actions={
          <>
            <Button asChild size="sm">
              <Link href="/applications">Add to planner</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard">Return to dashboard</Link>
            </Button>
          </>
        }
      />
      <MatchList matches={enriched} />
    </DashboardShell>
  );
}
