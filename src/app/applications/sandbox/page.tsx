import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { PageHero } from '@/components/layout/page-hero';
import { SectionNav } from '@/components/layout/section-nav';
import { PLANNER_SECTION_ITEMS } from '@/components/layout/navigation';
import { SandboxBoard } from '@/components/applications/sandbox-board';
import { DEMO_SANDBOX_APPS } from '@/lib/data/student-demo-data';
import { AnimatedSection } from '@/components/layout/animated-section';

export const metadata: Metadata = {
  title: 'Practice board'
};

export default async function SandboxPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const submittedCount = DEMO_SANDBOX_APPS.filter(
    (a) => a.status === 'submitted' || a.status === 'confirmed'
  ).length;

  return (
    <DashboardShell>
      <SectionNav items={PLANNER_SECTION_ITEMS} />
      <PageHero
        tone="student"
        eyebrow="Practice board"
        title="Try applying — for real, but not really"
        description="A safe sandbox to practice UCAS, Common App, and direct applications side-by-side. Nothing here gets submitted anywhere."
        highlight="Demo mode · 🇬🇧 🇨🇭 🇳🇱 🇺🇸"
        accent="Sandbox"
        stats={[
          { label: 'Applications', value: String(DEMO_SANDBOX_APPS.length), detail: 'Across 4 countries' },
          { label: 'Submitted', value: String(submittedCount), detail: 'Sent' },
          { label: 'Platforms', value: '4', detail: 'UCAS · Common App · Direct' }
        ]}
      />

      <AnimatedSection className="mt-8">
        <div className="surface-card surface-card--static">
          <div className="relative z-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Unified applications</p>
            <p className="text-lg font-semibold text-foreground mb-1">Submit from Ascenda</p>
            <p className="text-xs text-muted-foreground mb-6">
              Click &ldquo;Apply&rdquo; to simulate submitting an application. Status updates instantly.
            </p>
            <SandboxBoard initialApps={DEMO_SANDBOX_APPS} />
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="mt-8" delay={0.1}>
        <div className="surface-card surface-card--static">
          <div className="relative z-10">
            <p className="text-base font-semibold text-foreground">About the practice board</p>
            <ul className="mt-4 space-y-3 text-sm text-foreground/80">
              <li><strong>No real submissions</strong> — this is a practice space. Nothing is sent to UCAS, Common App, or any university.</li>
              <li><strong>Unified view</strong> — in the future, Ascenda will connect to multiple application platforms so you can manage everything from one dashboard.</li>
              <li><strong>Status tracking</strong> — see application progress across all platforms at a glance.</li>
            </ul>
          </div>
        </div>
      </AnimatedSection>
    </DashboardShell>
  );
}
