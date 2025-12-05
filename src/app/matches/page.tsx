import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/shell';
import { MatchList } from '@/components/match/match-list';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { SectionNav } from '@/components/layout/section-nav';
import { EXPLORE_SECTION_ITEMS } from '@/components/layout/navigation';
import { loadMatchesForProfile } from '@/lib/matching/service';

export const metadata: Metadata = {
  title: 'Match suggestions | Ascenda'
};

export default async function MatchesPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const matchResult = await loadMatchesForProfile(supabase, user.id);

  if (matchResult.missingSections.length > 0) {
    return (
      <DashboardShell>
        <SectionNav items={EXPLORE_SECTION_ITEMS} />
        <PageHero
          eyebrow="Matches"
          title="Dial in your Fit Score"
          description="Complete your profile to unlock personalized program rankings, tuition filters, and signal tracking."
          highlight="Profile info missing"
          stats={[{ label: 'Matches', value: '—' }, { label: 'Programs', value: '0' }, { label: 'Signals', value: '—' }]}
          actions={
            <Button asChild size="sm">
              <Link href="/profile">Finish profile</Link>
            </Button>
          }
        />
        <div className="rounded-[28px] border border-dashed border-border bg-muted/60 p-8 text-center text-muted-foreground">
          Complete your profile to receive personalized matches.
        </div>
      </DashboardShell>
    );
  }

  if (matchResult.catalogSize.programs === 0 || matchResult.catalogSize.universities === 0) {
    return (
      <DashboardShell>
        <div className="rounded-[28px] border border-dashed border-border bg-muted/60 p-8 text-center text-muted-foreground">
          We could not load the program catalog yet. Please check back later.
        </div>
      </DashboardShell>
    );
  }

  const enriched = matchResult.matches;

  const heroStats = [
    { label: 'Programs', value: `${matchResult.catalogSize.programs}`, detail: 'in catalog' },
    { label: 'Live matches', value: `${enriched.length}`, detail: 'Ranked for you' },
    { label: 'Top fit', value: enriched[0] ? `${enriched[0].score}%` : '—', detail: 'Highest score' }
  ];
  const topMatch = enriched[0];

  return (
    <DashboardShell>
      <SectionNav items={EXPLORE_SECTION_ITEMS} />
      <PageHero
        eyebrow="Matches"
        title="Match suggestions"
        description="Ranked by eligibility, academic alignment, preferences, and outcome indicators."
        highlight="Signals watchlist"
        stats={heroStats}
        breadcrumbs={<Breadcrumbs />}
        actions={
          <>
            <Button asChild size="sm">
              <Link href="/applications">Add to planner</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard">Return to dashboard</Link>
            </Button>
          </>
        }
      />
      {topMatch ? (
        <div className="sticky top-4 z-10 mb-4 rounded-[24px] border border-border bg-card/85 p-4 backdrop-blur shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">Top fit snapshot</p>
              <p className="text-sm font-semibold text-foreground">
                {topMatch.program.name} • {topMatch.university.name}
              </p>
              <p className="text-xs text-muted-foreground">Score {topMatch.score}% — {topMatch.tier} tier</p>
            </div>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link href="/applications">Save to planner</Link>
              </Button>
              <Button size="sm" variant="outline">
                Share
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {enriched.length ? (
        <MatchList matches={enriched} />
      ) : (
        <div className="rounded-[28px] border border-dashed border-border bg-muted/60 p-8 text-center text-muted-foreground">
          <p className="text-base font-semibold text-foreground">No matches yet</p>
          <p className="mt-2 text-sm">
            Try widening your budget, adding more destinations, or updating test scores to unlock suggestions.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button asChild size="sm">
              <Link href="/profile?step=preferences">Adjust preferences</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/profile?step=academics">Update academics</Link>
            </Button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
