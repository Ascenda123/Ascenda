import { PageHero } from '@/components/layout/page-hero';
import {
  DEMO_COUNSELLOR_DOCS,
  DEMO_REC_LETTERS,
  type CounsellorDocument,
  type CounsellorDocStatus
} from '@/lib/data/student-demo-data';
import { CounsellorDocumentBoard } from '../_components/counsellor-document-board';

const received = DEMO_COUNSELLOR_DOCS.filter((d) => d.status === 'received').length;
const pending = DEMO_COUNSELLOR_DOCS.filter((d) => d.status === 'pending').length;
const overdue = DEMO_COUNSELLOR_DOCS.filter((d) => d.status === 'overdue').length;

export default function CounsellorDocumentsPage() {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Counsellor View"
        accent="Documents"
        highlight={overdue > 0 ? `${overdue} overdue` : 'All on track'}
        title="Document Management"
        description="Track transcripts, recommendation letters, essays, and certificates across your entire cohort."
        stats={[
          { label: 'Total', value: String(DEMO_COUNSELLOR_DOCS.length), detail: 'Documents tracked' },
          { label: 'Received', value: String(received), detail: 'Complete' },
          { label: 'Pending', value: String(pending), detail: 'Awaiting' },
          { label: 'Overdue', value: String(overdue), detail: 'Need attention' }
        ]}
      />

      <CounsellorDocumentBoard documents={DEMO_COUNSELLOR_DOCS} />
    </div>
  );
}
