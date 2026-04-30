import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { OutcomeDashboard } from '../_components/outcome-dashboard';
import { AnimatedSection } from '@/components/layout/animated-section';
import { getOutcomeStats } from '@/lib/data/counsellor-dummy-data';

export const metadata: Metadata = { title: 'Outcomes · Counsellor' };

const stats = getOutcomeStats();

export default function CounsellorOutcomesPage() {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Counsellor"
        accent="Outcomes"
        title="Outcome tracking"
        description="Acceptances, rejections, waitlists, and pending responses across the cohort."
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
