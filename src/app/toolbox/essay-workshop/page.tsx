import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { EssayWorkshop } from '@/components/toolbox/essay-workshop';
import { DEMO_BUILDING_BLOCKS, DEMO_ESSAY_PROMPTS, DEMO_ACTIVITIES } from '@/lib/data/student-demo-data';

export const metadata: Metadata = { title: 'Essay Workshop | Ascenda' };

export default async function EssayWorkshopPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // No DashboardShell, no PageHero, no SectionNav — the workshop IS the page
  return (
    <EssayWorkshop blocks={DEMO_BUILDING_BLOCKS} prompts={DEMO_ESSAY_PROMPTS} activities={DEMO_ACTIVITIES} />
  );
}
