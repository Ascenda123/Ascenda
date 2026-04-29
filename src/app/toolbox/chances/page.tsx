import type { Metadata } from 'next';
import { DashboardShell } from '@/components/layout/shell';
import { SectionNav } from '@/components/layout/section-nav';
import { TOOLBOX_SECTION_ITEMS } from '@/components/layout/navigation';
import { ChancesClient } from '@/components/toolbox/chances-client';
import { DEMO_STUDENT_GRADES, DEMO_UNIVERSITY_CHANCES } from '@/lib/data/student-demo-data';

export const metadata: Metadata = { title: 'Chances Calculator | Ascenda' };

export default function ChancesPage() {
  return (
    <DashboardShell>
      <SectionNav items={TOOLBOX_SECTION_ITEMS} />
      <ChancesClient grades={DEMO_STUDENT_GRADES} fallbackUniversities={DEMO_UNIVERSITY_CHANCES} />
    </DashboardShell>
  );
}
