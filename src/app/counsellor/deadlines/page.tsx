import { PageHero } from '@/components/layout/page-hero';
import { getAllDeadlines, getCohortStats } from '@/lib/data/counsellor-dummy-data';
import { DeadlineMonitor } from '../_components/deadline-monitor';
import { AnimatedSection } from '@/components/layout/animated-section';

const stats = getCohortStats();
const allDeadlines = getAllDeadlines();

const today = new Date();
today.setHours(0, 0, 0, 0);
const weekCutoff = new Date(today); weekCutoff.setDate(weekCutoff.getDate() + 7);
const monthCutoff = new Date(today); monthCutoff.setDate(monthCutoff.getDate() + 30);
const overdue = allDeadlines.filter((d) => new Date(d.date) < today).length;
const thisWeek = allDeadlines.filter((d) => {
  const date = new Date(d.date);
  return date >= today && date <= weekCutoff;
}).length;
const thisMonth = allDeadlines.filter((d) => {
  const date = new Date(d.date);
  return date >= today && date <= monthCutoff;
}).length;

export default function CounsellorDeadlinesPage() {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Counsellor View"
        accent="Deadlines"
        highlight={`${allDeadlines.length} total`}
        title="Deadline Monitor"
        description="All upcoming deadlines across your cohort in one place. Grouped by urgency — never let a student miss a critical date."
        stats={[
          { label: 'Total', value: String(allDeadlines.length), detail: 'All tracked deadlines' },
          { label: 'Overdue', value: String(overdue), detail: 'Require immediate action' },
          { label: 'This Week', value: String(thisWeek), detail: 'Due in ≤7 days' },
          { label: 'This Month', value: String(thisMonth), detail: 'Due in ≤30 days' }
        ]}
      />
      <AnimatedSection>
        <DeadlineMonitor deadlines={allDeadlines} />
      </AnimatedSection>
    </div>
  );
}
