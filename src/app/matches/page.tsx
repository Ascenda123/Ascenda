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
import { getFitScoreVisuals } from '@/lib/theme/fit-score';
import { cn } from '@/lib/utils';
import { TrackProgramButton } from '@/components/programs/track-program-button';
import { ACTION_TEXT, MATCHES_TEXT } from '@/lib/constants/text';
import { StudentWorkspaceDock } from '@/components/layout/student-workspace-dock';

export const metadata: Metadata = {
  title: 'Match suggestions | Ascenda'
};

export const dynamic = 'force-dynamic';

export default async function MatchesPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const matchResult = await loadMatchesForProfile(supabase, user.id, { resultLimit: 300 });

  if (matchResult.error) {
    return (
      <DashboardShell>
        <SectionNav items={EXPLORE_SECTION_ITEMS} />
        <PageHero
          eyebrow={MATCHES_TEXT.hero.eyebrow}
          title="Matches temporarily unavailable"
          description="We hit an issue loading recommendations. Please try again shortly."
          highlight="Service issue"
          stats={[{ label: 'Matches', value: '—' }, { label: 'Programs', value: '—' }, { label: 'Signals', value: '—' }]}
          breadcrumbs={<Breadcrumbs />}
          actions={
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard">{ACTION_TEXT.returnToDashboard}</Link>
            </Button>
          }
        />
        <div className="rounded-[28px] border border-dashed border-border bg-muted/60 p-8 text-center text-muted-foreground">
          <p className="text-base font-semibold text-foreground">We couldn&apos;t load matches.</p>
          <p className="mt-2 text-sm">Stage: {matchResult.error.stage}. Please retry or update your profile later.</p>
        </div>
      </DashboardShell>
    );
  }

  if (matchResult.missingSections.length > 0) {
    return (
      <DashboardShell>
        <SectionNav items={EXPLORE_SECTION_ITEMS} />
        <PageHero
          eyebrow={MATCHES_TEXT.hero.eyebrow}
          title={MATCHES_TEXT.profileIncomplete.title}
          description={MATCHES_TEXT.profileIncomplete.description}
          highlight={MATCHES_TEXT.profileIncomplete.highlight}
          stats={[{ label: 'Matches', value: '—' }, { label: 'Programs', value: '0' }, { label: 'Signals', value: '—' }]}
          actions={
            <Button asChild size="sm">
              <Link href="/profile/wizard">{ACTION_TEXT.finishProfile}</Link>
            </Button>
          }
        />
        <div className="rounded-[28px] border border-dashed border-border bg-muted/60 p-8 text-center text-muted-foreground">
          {MATCHES_TEXT.profileIncomplete.emptyMessage}
        </div>
      </DashboardShell>
    );
  }

  if (matchResult.catalogSize.programs === 0 || matchResult.catalogSize.universities === 0) {
    return (
      <DashboardShell>
        <div className="rounded-[28px] border border-dashed border-border bg-muted/60 p-8 text-center text-muted-foreground">
          {MATCHES_TEXT.catalogUnavailable}
        </div>
      </DashboardShell>
    );
  }

  const enriched = matchResult.matches;

  const heroStats = [
    { label: 'Programs', value: `${matchResult.catalogSize.programs}`, detail: 'in catalog' },
    { label: 'Eligible matches', value: `${enriched.length}`, detail: 'Ranked for you' },
    { label: 'Top fit', value: enriched[0] ? `${enriched[0].score}%` : '—', detail: 'Highest score' }
  ];
  const topMatch = enriched[0];
  const topMatchVisuals = getFitScoreVisuals(topMatch?.score);

  return (
    <DashboardShell>
      <SectionNav items={EXPLORE_SECTION_ITEMS} />
      <PageHero
        eyebrow={MATCHES_TEXT.hero.eyebrow}
        title={MATCHES_TEXT.hero.title}
        description={MATCHES_TEXT.hero.description}
        highlight={MATCHES_TEXT.hero.highlight}
        stats={heroStats}
        breadcrumbs={<Breadcrumbs />}
        actions={
          <>
            {topMatch ? (
              <TrackProgramButton
                programId={topMatch.program.id}
                programName={topMatch.program.name}
                universityName={topMatch.university.name}
                location={topMatch.university.country}
                fitScore={topMatch.score}
                labelVariant="planner"
              />
            ) : (
              <Button asChild size="sm">
                <Link href="/applications">{ACTION_TEXT.addToPlanner}</Link>
              </Button>
            )}
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard">{ACTION_TEXT.returnToDashboard}</Link>
            </Button>
          </>
        }
      />
      <StudentWorkspaceDock
        current="matches"
        metrics={{
          dashboard: { value: 'Command', detail: 'priorities and deadlines' },
          matches: { value: `${enriched.length}`, detail: 'ranked programs available' },
          applications: { value: topMatch ? 'Track' : 'Planner', detail: topMatch ? 'save top programs to planner' : 'build your plan' },
          profile: { value: 'Profile', detail: 'refine your fit signals' },
          search: { value: 'Catalog', detail: 'expand beyond recommendations' }
        }}
      />
      {topMatch ? (
        <div className="surface-toolbar sticky top-4 z-10 mb-4 rounded-2xl p-4">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
                {MATCHES_TEXT.topSnapshot.eyebrow}
              </p>
              <p className="text-sm font-semibold text-foreground">
                {topMatch.program.name} • {topMatch.university.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {MATCHES_TEXT.topSnapshot.scoreLabel}{' '}
                <span className={cn('font-semibold', topMatchVisuals.textClass)}>
                  {topMatchVisuals.value !== null ? `${topMatchVisuals.value}%` : 'N/A'}
                </span>{' '}
                — {topMatch.tier} tier
              </p>
            </div>
            <div className="flex gap-2">
              <TrackProgramButton
                programId={topMatch.program.id}
                programName={topMatch.program.name}
                universityName={topMatch.university.name}
                location={topMatch.university.country}
                fitScore={topMatch.score}
                labelVariant="planner"
              />
              <Button size="sm" variant="outline">
                {ACTION_TEXT.share}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {enriched.length ? (
        <MatchList matches={enriched} />
      ) : (
        <div className="rounded-[28px] border border-dashed border-border bg-muted/60 p-8 text-center text-muted-foreground">
          <p className="text-base font-semibold text-foreground">{MATCHES_TEXT.emptyState.title}</p>
          <p className="mt-2 text-sm">
            {MATCHES_TEXT.emptyState.description}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button asChild size="sm">
              <Link href="/profile/wizard?step=lifestyle_preferences">{ACTION_TEXT.adjustPreferences}</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/profile/wizard?step=academic_details">{ACTION_TEXT.updateAcademics}</Link>
            </Button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
