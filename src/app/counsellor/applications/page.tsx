import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { SectionNav } from '@/components/layout/section-nav';
import { COUNSELLOR_SECTION_ITEMS } from '@/components/layout/navigation';
import { ApplicationOverview } from '../_components/application-overview';
import { AnimatedSection } from '@/components/layout/animated-section';
import { getAllApplicationsWithPlatform } from '@/lib/data/counsellor-dummy-data';

export const metadata: Metadata = { title: 'Applications | Counsellor | Ascenda' };

const allApps = getAllApplicationsWithPlatform();
const submitted = allApps.filter((a) => a.status === 'submitted').length;
const planning = allApps.filter((a) => a.status === 'planning' || a.status === 'in_progress').length;

export default function CounsellorApplicationsPage() {
  return (
    <div className="space-y-6">
      <SectionNav items={COUNSELLOR_SECTION_ITEMS} />
      <PageHero
        eyebrow="Counsellor"
        title="Application overview"
        description="View all student applications across platforms in one place — kanban board or list view with filtering."
        stats={[
          { label: 'Total', value: String(allApps.length), detail: 'Applications' },
          { label: 'Submitted', value: String(submitted), detail: 'Sent to universities' },
          { label: 'In progress', value: String(planning), detail: 'Still being prepared' },
        ]}
      />
      <AnimatedSection>
        <ApplicationOverview />
      </AnimatedSection>
    </div>
  );
}
