import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { PageHero } from '@/components/layout/page-hero';
import { SectionNav } from '@/components/layout/section-nav';
import { TOOLBOX_SECTION_ITEMS } from '@/components/layout/navigation';
import { BuildingBlocksBoard } from '@/components/toolbox/building-blocks-board';
import { EssayPromptMatcher } from '@/components/toolbox/essay-prompt-matcher';
import { DEMO_BUILDING_BLOCKS, DEMO_ESSAY_PROMPTS } from '@/lib/data/student-demo-data';
import { AnimatedSection } from '@/components/layout/animated-section';

export const metadata: Metadata = {
  title: 'Essay Toolbox | Ascenda'
};

export default async function ToolboxPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardShell>
      <SectionNav items={TOOLBOX_SECTION_ITEMS} />
      <PageHero
        eyebrow="Essay toolbox"
        title="Your story, deconstructed"
        description="All your strengths, experiences, and insights — organised as building blocks for crafting compelling essays and personal statements."
        stats={[
          { label: 'Blocks', value: String(DEMO_BUILDING_BLOCKS.length), detail: 'Story pieces' },
          { label: 'Prompts', value: String(DEMO_ESSAY_PROMPTS.length), detail: 'Matched' },
          { label: 'Sources', value: '3', detail: 'Profile, Counsellor, Ascendi' }
        ]}
      />

      <AnimatedSection className="mt-8">
        <div className="surface-card surface-card--static">
          <div className="relative z-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Building blocks</p>
            <p className="text-lg font-semibold text-foreground mb-1">Your story pieces</p>
            <p className="text-xs text-muted-foreground mb-6">
              Click any block to expand. Use the filters to focus on specific categories or sources.
            </p>
            <BuildingBlocksBoard blocks={DEMO_BUILDING_BLOCKS} />
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="mt-8" delay={0.1}>
        <div className="surface-card surface-card--static">
          <div className="relative z-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Prompt matcher</p>
            <p className="text-lg font-semibold text-foreground mb-1">Essay prompts</p>
            <p className="text-xs text-muted-foreground mb-6">
              See which building blocks map to common application essay prompts.
            </p>
            <EssayPromptMatcher prompts={DEMO_ESSAY_PROMPTS} blocks={DEMO_BUILDING_BLOCKS} />
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="mt-8" delay={0.15}>
        <div className="surface-card surface-card--static">
          <div className="relative z-10">
            <p className="text-base font-semibold text-foreground">How to use these</p>
            <ul className="mt-4 space-y-3 text-sm text-foreground/80">
              <li><strong>Browse your blocks</strong> — each one represents a strength, experience, or insight about you.</li>
              <li><strong>Match to prompts</strong> — see which blocks relate to specific essay questions.</li>
              <li><strong>Craft your story</strong> — combine blocks like puzzle pieces to build a compelling narrative.</li>
              <li><strong>Stay authentic</strong> — these are your real experiences, not AI-generated content. Use them as inspiration.</li>
            </ul>
          </div>
        </div>
      </AnimatedSection>
    </DashboardShell>
  );
}
