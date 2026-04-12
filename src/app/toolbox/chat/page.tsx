import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { PageHero } from '@/components/layout/page-hero';
import { SectionNav } from '@/components/layout/section-nav';
import { TOOLBOX_SECTION_ITEMS } from '@/components/layout/navigation';
import { AscendiChatMock } from '@/components/toolbox/ascendi-chat-mock';
import { DEMO_CONVERSATIONS } from '@/lib/data/student-demo-data';
import { AnimatedSection } from '@/components/layout/animated-section';

export const metadata: Metadata = {
  title: 'Ascendi Chat | Ascenda'
};

export default async function ChatPage() {
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
        eyebrow="Ascendi"
        title="Chat with Ascendi"
        description="Your AI-powered university guidance assistant. Ask about programmes, essays, deadlines, and more."
        highlight="Preview"
        stats={[
          { label: 'Conversations', value: String(DEMO_CONVERSATIONS.length), detail: 'Sample chats' },
          { label: 'Status', value: 'Preview', detail: 'Coming soon' }
        ]}
      />

      <AnimatedSection className="mt-8">
        <div className="surface-card surface-card--static lg:p-8">
          <div className="relative z-10">
            <AscendiChatMock conversations={DEMO_CONVERSATIONS} />
          </div>
        </div>
      </AnimatedSection>
    </DashboardShell>
  );
}
