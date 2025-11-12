import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { rankMatches, type MatchInput } from '@/lib/matching/engine';
import { MatchList } from '@/components/match/match-list';

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

  const [{ data: academics }, { data: preferences }, { data: aspirations }] = await Promise.all([
    supabase.from('student_academics').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_preferences').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_aspirations').select('*').eq('profile_id', user.id).single()
  ]);

  if (!academics || !preferences || !aspirations) {
    return (
      <DashboardShell>
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          Complete your profile to receive personalized matches.
        </div>
      </DashboardShell>
    );
  }

  const [{ data: programs }, { data: universities }, { data: requirements }] = await Promise.all([
    supabase.from('programs').select('*'),
    supabase.from('universities').select('*'),
    supabase.from('program_requirements').select('*')
  ]);

  if (!programs || !universities) {
    return (
      <DashboardShell>
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          We could not load the program catalog yet. Please check back later.
        </div>
      </DashboardShell>
    );
  }

  const requirementMap = new Map(requirements?.map((item) => [item.program_id, item]));
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
      } satisfies MatchInput;
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
      blockingReasons: result.blockingReasons
    };
  });

  return (
    <DashboardShell>
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Match suggestions</h1>
        <p className="text-sm text-slate-600">
          Ranked by eligibility, academic alignment, preferences, and outcome indicators.
        </p>
      </section>
      <MatchList matches={enriched} />
    </DashboardShell>
  );
}
