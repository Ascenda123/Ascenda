import type { Metadata } from 'next';
import { DashboardShell } from '@/components/layout/shell';
import { PageHero } from '@/components/layout/page-hero';
import { SectionNav } from '@/components/layout/section-nav';
import { TOOLBOX_SECTION_ITEMS } from '@/components/layout/navigation';
import { DeadlineTimelineTool } from '@/components/toolbox/deadline-timeline-tool';
import { DEMO_TIMELINE_DEADLINES } from '@/lib/data/student-demo-data';

export const metadata: Metadata = { title: 'Deadline timeline' };

export default async function TimelinePage() {

  const now = new Date();
  const upcoming = DEMO_TIMELINE_DEADLINES.filter((d) => new Date(d.date) >= now).length;
  const next14 = DEMO_TIMELINE_DEADLINES.filter((d) => {
    const diff = (new Date(d.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 14;
  }).length;

  return (
    <DashboardShell>
      <SectionNav items={TOOLBOX_SECTION_ITEMS} />
      <PageHero
        tone="student"
        eyebrow="Deadline timeline"
        title="Every deadline in one place"
        description="Submissions, exams, interviews, docs — laid out in order so nothing sneaks up on you."
        accent="Timeline"
        stats={[
          { label: 'Upcoming', value: String(upcoming), detail: 'Deadlines ahead' },
          { label: 'Next 14 days', value: String(next14), detail: 'Requiring action' },
          { label: 'Total', value: String(DEMO_TIMELINE_DEADLINES.length), detail: 'Tracked deadlines' },
        ]}
      />
      <DeadlineTimelineTool deadlines={DEMO_TIMELINE_DEADLINES} />
    </DashboardShell>
  );
}
