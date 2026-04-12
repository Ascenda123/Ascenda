import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { PageHero } from '@/components/layout/page-hero';
import { SectionNav } from '@/components/layout/section-nav';
import { TOOLBOX_SECTION_ITEMS } from '@/components/layout/navigation';
import { EssayWorkshop } from '@/components/toolbox/essay-workshop';
import { DEMO_BUILDING_BLOCKS, DEMO_ESSAY_PROMPTS } from '@/lib/data/student-demo-data';

export const metadata: Metadata = { title: 'Essay Workshop | Ascenda' };

export default async function EssayWorkshopPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <DashboardShell>
      <SectionNav items={TOOLBOX_SECTION_ITEMS} />
      <PageHero
        eyebrow="Essay Workshop"
        title="Write with your story"
        description="Select building blocks on the left, draft in the centre with platform-specific limits, and reference prompts on the right."
        stats={[
          { label: 'Blocks', value: String(DEMO_BUILDING_BLOCKS.length), detail: 'Story pieces' },
          { label: 'Prompts', value: String(DEMO_ESSAY_PROMPTS.length), detail: 'Matched' },
          { label: 'Platforms', value: '4', detail: 'UCAS, Common App, UC, Custom' },
        ]}
      />
      <EssayWorkshop blocks={DEMO_BUILDING_BLOCKS} prompts={DEMO_ESSAY_PROMPTS} />
    </DashboardShell>
  );
}
