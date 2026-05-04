import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { PageHero } from '@/components/layout/page-hero';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { SectionNav } from '@/components/layout/section-nav';
import { PLANNER_SECTION_ITEMS } from '@/components/layout/navigation';
import { ApplicationsHub } from '@/components/applications/applications-hub';
import {
  DEMO_SANDBOX_APPS,
  DEMO_REQUIREMENTS,
  DEMO_NUDGES,
  DEMO_OUTCOMES,
  DEMO_TIMELINE_DEADLINES
} from '@/lib/data/student-demo-data';

export const metadata: Metadata = {
  title: 'Applications'
};

export default async function ApplicationsPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const today = new Date();
  const isSameDay = (iso: string) => new Date(iso).toDateString() === today.toDateString();

  const dailySummary = {
    deadlines: DEMO_TIMELINE_DEADLINES.filter((d) => isSameDay(d.date)).length,
    nudges: DEMO_NUDGES.filter((n) => !n.dismissed).length,
    submitted: DEMO_SANDBOX_APPS.filter((a) => a.status === 'submitted' || a.status === 'confirmed').length
  };

  const heroStats = [
    { label: 'Applications', value: String(DEMO_SANDBOX_APPS.length), detail: 'Tracked' },
    { label: 'Submitted', value: String(dailySummary.submitted), detail: `of ${DEMO_SANDBOX_APPS.length}` },
    { label: 'Open nudges', value: String(dailySummary.nudges), detail: 'Need action' }
  ];

  return (
    <DashboardShell>
      <SectionNav items={PLANNER_SECTION_ITEMS} />
      <PageHero
        tone="student"
        eyebrow="Your applications"
        title="Where everything's at"
        description="Open any application to see its requirements, tasks, and decision. Nudges below tell you what to do next."
        highlight={`${dailySummary.nudges} ${dailySummary.nudges === 1 ? 'nudge' : 'nudges'} waiting`}
        accent="Today"
        stats={heroStats}
        breadcrumbs={<Breadcrumbs />}
      />
      <ApplicationsHub
        apps={DEMO_SANDBOX_APPS}
        requirements={DEMO_REQUIREMENTS}
        nudges={DEMO_NUDGES}
        outcomes={DEMO_OUTCOMES}
        deadlines={DEMO_TIMELINE_DEADLINES}
      />
    </DashboardShell>
  );
}
