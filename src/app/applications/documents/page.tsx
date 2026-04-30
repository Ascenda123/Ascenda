import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { PageHero } from '@/components/layout/page-hero';
import { SectionNav } from '@/components/layout/section-nav';
import { PLANNER_SECTION_ITEMS } from '@/components/layout/navigation';
import { RecLetterWorkflow } from '@/components/applications/rec-letter-workflow';
import { DEMO_REC_LETTERS } from '@/lib/data/student-demo-data';
import { AnimatedSection } from '@/components/layout/animated-section';

export const metadata: Metadata = {
  title: 'Documents'
};

export default async function DocumentsPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const completedLetters = DEMO_REC_LETTERS.filter(
    (l) => l.status === 'uploaded' || l.status === 'signed'
  ).length;

  return (
    <DashboardShell>
      <SectionNav items={PLANNER_SECTION_ITEMS} />
      <PageHero
        tone="student"
        eyebrow="Documents"
        title="Letters, transcripts, the rest"
        description="Keep your recommendation letters, transcripts, and other application docs in one tidy place."
        accent="Files"
        stats={[
          { label: 'Letters', value: `${completedLetters}/${DEMO_REC_LETTERS.length}`, detail: 'Received' },
          { label: 'Documents', value: '3', detail: 'Uploaded' },
          { label: 'Pending', value: `${DEMO_REC_LETTERS.length - completedLetters}`, detail: 'Awaiting' }
        ]}
      />

      <AnimatedSection className="mt-8">
        <div className="surface-card surface-card--static">
          <div className="relative z-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Recommendation letters</p>
            <p className="text-lg font-semibold text-foreground mb-1">Letter tracker</p>
            <p className="text-xs text-muted-foreground mb-6">
              Track the status of each recommendation letter from request to upload.
            </p>
            <RecLetterWorkflow letters={DEMO_REC_LETTERS} />
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="mt-8" delay={0.1}>
        <div className="surface-card surface-card--static">
          <div className="relative z-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Uploaded documents</p>
            <p className="text-lg font-semibold text-foreground mb-1">Your files</p>
            <p className="text-xs text-muted-foreground mb-6">
              Transcripts, certificates, and other supporting documents.
            </p>
            <div className="space-y-3">
              {[
                { name: 'IB_Transcript_2025.pdf', type: 'Transcript', date: 'Mar 2025', size: '1.2 MB' },
                { name: 'Personal_Statement_v3.docx', type: 'Essay', date: 'Mar 2025', size: '45 KB' },
                { name: 'EE_Solar_Panel_Research.pdf', type: 'Extended Essay', date: 'Feb 2025', size: '3.8 MB' }
              ].map((doc) => (
                <div
                  key={doc.name}
                  className="flex items-center gap-4 rounded-2xl border border-border/60 bg-background/60 px-5 py-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.type}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{doc.date}</p>
                    <p className="text-[11px] text-muted-foreground/70">{doc.size}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>
    </DashboardShell>
  );
}
