import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { PageHero } from '@/components/layout/page-hero';
import { SectionNav } from '@/components/layout/section-nav';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { PLANNER_SECTION_ITEMS } from '@/components/layout/navigation';
import { CrossApplicationTasks, type SeedTask } from '@/components/applications/cross-application-tasks';
import { DEMO_REQUIREMENTS, DEMO_NUDGES, DEMO_TIMELINE_DEADLINES } from '@/lib/data/student-demo-data';

export const metadata: Metadata = {
  title: 'Tasks'
};

export default async function TasksPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Build a unified task feed from requirements, nudges, and deadlines.
  const seed: SeedTask[] = [];

  DEMO_REQUIREMENTS.forEach((req) => {
    req.cells
      .filter((cell) => cell.status !== 'not-required')
      .forEach((cell, i) => {
        seed.push({
          id: `${req.id}-cell-${i}`,
          name: `${cell.detail ?? cell.category} — ${req.university}`,
          done: cell.status === 'complete',
          group: req.university
        });
      });
  });

  DEMO_NUDGES.forEach((n) => {
    seed.push({
      id: `nudge-${n.id}`,
      name: n.title,
      done: false,
      dueDate: n.dueDate,
      group: n.university ?? 'General'
    });
  });

  DEMO_TIMELINE_DEADLINES.slice(0, 6).forEach((d) => {
    seed.push({
      id: `deadline-${d.id}`,
      name: d.title,
      done: false,
      dueDate: d.date,
      group: d.university
    });
  });

  return (
    <DashboardShell>
      <SectionNav items={PLANNER_SECTION_ITEMS} />
      <PageHero
        tone="student"
        eyebrow="Tasks"
        title="Everything still to do"
        description="Action items across all your applications. Mark them off as you go."
        accent="Action board"
        breadcrumbs={<Breadcrumbs />}
      />
      <CrossApplicationTasks initialTasks={seed} />
    </DashboardShell>
  );
}
