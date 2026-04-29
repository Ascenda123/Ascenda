import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { ApplicationOverview } from '../_components/application-overview';
import { AnimatedSection } from '@/components/layout/animated-section';
import { getAllApplicationsWithPlatform } from '@/lib/data/counsellor-dummy-data';

export const metadata: Metadata = { title: 'Student application overview | Counsellor | Ascenda' };

const allApps = getAllApplicationsWithPlatform();
const submitted = allApps.filter((a) => a.status === 'submitted').length;
const planning = allApps.filter((a) => a.status === 'planning' || a.status === 'in_progress').length;

export default function CounsellorApplicationsPage() {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Counsellor"
        title="Student application overview"
        description="Status of every student's applications across platforms — kanban or list view with filters. For deadline-only triage across the cohort, use Deadlines."
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
