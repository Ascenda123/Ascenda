import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { DEMO_BUILDING_BLOCKS, DEMO_ESSAY_PROMPTS, DEMO_ACTIVITIES } from '@/lib/data/student-demo-data';

export const metadata: Metadata = { title: 'Essay workshop' };

const EssayWorkshop = dynamic(
  () => import('@/components/toolbox/essay-workshop').then((m) => m.EssayWorkshop),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background text-sm text-muted-foreground">
        Loading essay workshop…
      </div>
    ),
  }
);

export default function EssayWorkshopPage() {
  return (
    <EssayWorkshop blocks={DEMO_BUILDING_BLOCKS} prompts={DEMO_ESSAY_PROMPTS} activities={DEMO_ACTIVITIES} />
  );
}
