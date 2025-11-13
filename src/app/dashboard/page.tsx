import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { TaskList } from '@/components/dashboard/task-list';
import { DeadlineTimeline } from '@/components/dashboard/deadline-timeline';
import { MatchList } from '@/components/match/match-list';
import { rankMatches, type MatchInput } from '@/lib/matching/engine';

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

  const [{ data: checklist }] = await Promise.all([
    supabase.from('application_checklist').select('*').order('due_date', { ascending: true }).limit(5)
  ]);

  const { data: deadlines } = await supabase
    .from('deadlines')
    .select('*')
    .gte('deadline_date', new Date().toISOString().slice(0, 10))
    .order('deadline_date', { ascending: true })
    .limit(5);

  const [{ data: academics }, { data: preferences }, { data: aspirations }] = await Promise.all([
    supabase.from('student_academics').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_preferences').select('*').eq('profile_id', user.id).single(),
    supabase.from('student_aspirations').select('*').eq('profile_id', user.id).single()
  ]);

  const [{ data: programs }, { data: universities }, { data: requirements }] = await Promise.all([
    supabase.from('programs').select('*').limit(10),
    supabase.from('universities').select('*'),
    supabase.from('program_requirements').select('*')
  ]);

  let matches = [];

  if (academics && preferences && aspirations && programs && universities) {
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

    matches = rankMatches(inputs).slice(0, 3).map((result) => {
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
  }

  return (
    <DashboardShell>
      <section className="space-y-2">
        <h1 className="font-display text-3xl">Welcome back</h1>
        <p className="text-sm text-white/70">Your mission control for applications, deadlines, and match insights.</p>
      </section>
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <TaskList
            title="Application checklist"
            tasks={(checklist ?? []).map((item) => ({
              id: item.id,
              name: item.task_name,
              status: item.status,
              dueDate: item.due_date ?? undefined
            }))}
          />
          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow-sm">
            <h2 className="font-display text-2xl text-white">Recommended programs</h2>
            {matches.length > 0 ? (
              <MatchList matches={matches} />
            ) : (
              <p className="text-sm text-white/60">Update your profile to receive tailored suggestions.</p>
            )}
          </div>
        </div>
        <aside className="space-y-6">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow-sm">
            <h2 className="font-display text-2xl text-white">Upcoming deadlines</h2>
            <DeadlineTimeline
              items={(deadlines ?? []).map((deadline) => ({
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
