import type { Metadata } from 'next';
import { EssayWorkshop } from '@/components/toolbox/essay-workshop';
import { DEMO_BUILDING_BLOCKS, DEMO_ESSAY_PROMPTS, DEMO_ACTIVITIES } from '@/lib/data/student-demo-data';

export const metadata: Metadata = { title: 'Essay workshop' };

export default async function EssayWorkshopPage() {
  return (
    <EssayWorkshop blocks={DEMO_BUILDING_BLOCKS} prompts={DEMO_ESSAY_PROMPTS} activities={DEMO_ACTIVITIES} />
  );
}
