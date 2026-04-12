import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { PageHero } from '@/components/layout/page-hero';
import { SectionNav } from '@/components/layout/section-nav';
import { TOOLBOX_SECTION_ITEMS } from '@/components/layout/navigation';
import { ActivityPortfolio } from '@/components/toolbox/activity-portfolio';
import { DEMO_ACTIVITIES } from '@/lib/data/student-demo-data';

export const metadata: Metadata = { title: 'Activity Portfolio | Ascenda' };

export default async function ActivitiesPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const totalHours = DEMO_ACTIVITIES.reduce((sum, a) => sum + a.hoursPerWeek * a.weeksPerYear, 0);

  return (
    <DashboardShell>
      <SectionNav items={TOOLBOX_SECTION_ITEMS} />
      <PageHero
        eyebrow="Activity Portfolio"
        title="Your extracurriculars"
        description="Log activities, track hours, and format descriptions for Common App (150 chars) or UC (350 chars)."
        stats={[
          { label: 'Activities', value: String(DEMO_ACTIVITIES.length), detail: 'Logged' },
          { label: 'Hours', value: totalHours.toLocaleString(), detail: 'Total commitment' },
          { label: 'Tier 1', value: String(DEMO_ACTIVITIES.filter((a) => a.tier === 1).length), detail: 'Leadership / National' },
        ]}
      />
      <ActivityPortfolio initialActivities={DEMO_ACTIVITIES} />
    </DashboardShell>
  );
}
