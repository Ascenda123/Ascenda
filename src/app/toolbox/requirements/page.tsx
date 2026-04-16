import type { Metadata } from 'next';
import { DashboardShell } from '@/components/layout/shell';
import { PageHero } from '@/components/layout/page-hero';
import { SectionNav } from '@/components/layout/section-nav';
import { TOOLBOX_SECTION_ITEMS } from '@/components/layout/navigation';
import { RequirementsChecker } from '@/components/toolbox/requirements-checker';
import { DEMO_REQUIREMENTS } from '@/lib/data/student-demo-data';

export const metadata: Metadata = { title: 'Requirements Checker | Ascenda' };

export default async function RequirementsPage() {

  const avgProgress = Math.round(DEMO_REQUIREMENTS.reduce((sum, r) => sum + r.progress, 0) / DEMO_REQUIREMENTS.length);
  const complete = DEMO_REQUIREMENTS.filter((r) => r.progress === 100).length;

  return (
    <DashboardShell>
      <SectionNav items={TOOLBOX_SECTION_ITEMS} />
      <PageHero
        eyebrow="Requirements Checker"
        title="What each university needs"
        description="Track subjects, exams, interviews, documents, and essays for every university on your shortlist."
        stats={[
          { label: 'Universities', value: String(DEMO_REQUIREMENTS.length), detail: 'Being tracked' },
          { label: 'Readiness', value: `${avgProgress}%`, detail: 'Average progress' },
          { label: 'Complete', value: String(complete), detail: `of ${DEMO_REQUIREMENTS.length} universities` },
        ]}
      />
      <RequirementsChecker matrix={DEMO_REQUIREMENTS} />
    </DashboardShell>
  );
}
