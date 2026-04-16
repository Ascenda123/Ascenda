import type { Metadata } from 'next';
import { DashboardShell } from '@/components/layout/shell';
import { PageHero } from '@/components/layout/page-hero';
import { SectionNav } from '@/components/layout/section-nav';
import { TOOLBOX_SECTION_ITEMS } from '@/components/layout/navigation';
import { ChancesCalculator } from '@/components/toolbox/chances-calculator';
import { DEMO_STUDENT_GRADES, DEMO_UNIVERSITY_CHANCES } from '@/lib/data/student-demo-data';

export const metadata: Metadata = { title: 'Chances Calculator | Ascenda' };

export default async function ChancesPage() {

  const reach = DEMO_UNIVERSITY_CHANCES.filter((u) => DEMO_STUDENT_GRADES.predicted - u.minimumScore < 1).length;
  const safety = DEMO_UNIVERSITY_CHANCES.filter((u) => DEMO_STUDENT_GRADES.predicted - u.minimumScore >= 5).length;

  return (
    <DashboardShell>
      <SectionNav items={TOOLBOX_SECTION_ITEMS} />
      <PageHero
        eyebrow="Chances Calculator"
        title="Where do you stand?"
        description="See how your predicted grades stack up against entry requirements. Override your score to explore different scenarios."
        stats={[
          { label: 'Universities', value: String(DEMO_UNIVERSITY_CHANCES.length), detail: 'On your shortlist' },
          { label: 'Predicted', value: String(DEMO_STUDENT_GRADES.predicted), detail: `${DEMO_STUDENT_GRADES.system} points` },
          { label: 'Safety', value: String(safety), detail: reach > 0 ? `${reach} reach` : 'All within range' },
        ]}
      />
      <ChancesCalculator grades={DEMO_STUDENT_GRADES} universities={DEMO_UNIVERSITY_CHANCES} />
    </DashboardShell>
  );
}
