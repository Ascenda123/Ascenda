import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { SectionNav } from '@/components/layout/section-nav';
import { COUNSELLOR_SECTION_ITEMS } from '@/components/layout/navigation';
import { OutcomeDashboard } from '../_components/outcome-dashboard';
import { AnimatedSection } from '@/components/layout/animated-section';
import { getOutcomeStats } from '@/lib/data/counsellor-dummy-data';

export const metadata: Metadata = { title: 'Outcomes | Counsellor | Ascenda' };

const stats = getOutcomeStats();

export default function CounsellorOutcomesPage() {
  return (
    <div className="space-y-6">
      <SectionNav items={COUNSELLOR_SECTION_ITEMS} />
      <PageHero
        eyebrow="Counsellor"
        title="Outcome tracking"
        description="Track application decisions across your entire cohort — acceptances, rejections, waitlists, and pending responses."
        stats={[
          { label: 'Total', value: String(stats.total), detail: 'Applications tracked' },
          { label: 'Acceptance', value: `${stats.acceptanceRate}%`, detail: 'Of decided applications' },
          { label: 'Pending', value: String(stats.pending), detail: 'Awaiting decisions' },
        ]}
      />
      <AnimatedSection>
        <OutcomeDashboard />
      </AnimatedSection>
    </div>
  );
}
