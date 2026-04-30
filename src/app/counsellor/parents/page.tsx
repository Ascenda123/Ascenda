import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { ParentPortal } from '../_components/parent-portal';
import { AnimatedSection } from '@/components/layout/animated-section';
import { getParentContacts } from '@/lib/data/counsellor-dummy-data';

export const metadata: Metadata = { title: 'Parents · Counsellor' };

const contacts = getParentContacts();
const needsResponse = contacts.filter((c) => c.status === 'needs-response').length;

export default function CounsellorParentsPage() {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Counsellor"
        accent="Comms"
        title="Parent communication"
        description="Counsellor-parent messaging with templates for common updates."
        stats={[
          { label: 'Parents', value: String(contacts.length), detail: 'In directory' },
          { label: 'Needs response', value: String(needsResponse), detail: 'Awaiting your reply' },
          { label: 'Active', value: String(contacts.filter((c) => c.status === 'active').length), detail: 'Ongoing conversations' },
        ]}
      />
      <AnimatedSection>
        <ParentPortal />
      </AnimatedSection>
    </div>
  );
}
