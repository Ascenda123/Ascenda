import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { PageHero } from '@/components/layout/page-hero';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { SectionNav } from '@/components/layout/section-nav';
import { PLANNER_SECTION_ITEMS } from '@/components/layout/navigation';
import { ApplicationDetail } from '@/components/applications/application-detail';
import {
  DEMO_SANDBOX_APPS,
  DEMO_REQUIREMENTS,
  DEMO_OUTCOMES,
  DEMO_TIMELINE_DEADLINES,
  DEMO_REC_LETTERS
} from '@/lib/data/student-demo-data';

export const metadata: Metadata = {
  title: 'Application detail'
};

export default async function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const app = DEMO_SANDBOX_APPS.find((a) => a.id === params.id);
  if (!app) {
    notFound();
  }

  const requirement =
    DEMO_REQUIREMENTS.find((r) => r.university === app.university) ??
    DEMO_REQUIREMENTS[0];
  const outcome = DEMO_OUTCOMES.find((o) => o.university === app.university && o.program === app.program);
  const deadlines = DEMO_TIMELINE_DEADLINES.filter((d) => d.university === app.university);
  const letters = DEMO_REC_LETTERS.filter((l) => l.universities.includes(app.university));

  return (
    <DashboardShell>
      <SectionNav items={PLANNER_SECTION_ITEMS} />
      <PageHero
        tone="student"
        eyebrow={`${app.flagEmoji} ${app.country} · ${app.platform}`}
        title={app.university}
        description={app.program}
        accent={app.status === 'submitted' || app.status === 'confirmed' ? 'Submitted' : 'In progress'}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Applications', href: '/applications' },
              { label: app.university }
            ]}
          />
        }
        stats={[
          { label: 'Progress', value: `${requirement?.progress ?? 0}%`, detail: 'Complete' },
          { label: 'Deadlines', value: String(deadlines.length), detail: 'Tracked' },
          { label: 'Letters', value: String(letters.length), detail: 'Linked' }
        ]}
      />
      <ApplicationDetail
        app={app}
        requirement={requirement}
        outcome={outcome}
        deadlines={deadlines}
        letters={letters}
      />
    </DashboardShell>
  );
}
