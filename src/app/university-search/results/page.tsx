'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MatchTier } from '@/lib/matching/engine';
import { useShortlist } from '@/components/university-search/shortlist-store';
import { placeholderResults, TIER_ORDER, type PlaceholderResult } from '@/components/university-search/placeholder-results';

const TIER_DESCRIPTIONS: Record<MatchTier, string> = {
  Reach: 'Prestigious programs that stretch your profile.',
  Match: 'Programs that align closely with your interests and stats.',
  Safe: 'Options you exceed academically and logistically.'
};
const TIER_BADGE_STYLES: Record<MatchTier, string> = {
  Reach: 'bg-rose-100 text-rose-800 ring-rose-100',
  Match: 'bg-amber-100 text-amber-800 ring-amber-100',
  Safe: 'bg-emerald-100 text-emerald-800 ring-emerald-100'
};

export default function UniversitySearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';
  const normalizedQuery = query.toLowerCase();
  const { items: shortlist, addItem } = useShortlist();
  const results = normalizedQuery
    ? placeholderResults.filter((result) => {
        const haystack = `${result.name} ${result.program} ${result.location}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : placeholderResults;
  const hasNoMatches = normalizedQuery.length > 0 && results.length === 0;
  const groupedResults = useMemo(
    () =>
      TIER_ORDER.map((tier) => ({
        tier,
        matches: results.filter((result) => result.tier === tier)
      })),
    [results]
  );

  const handleAdd = (result: (typeof placeholderResults)[number]) => {
    addItem({
      id: result.id,
      name: result.name,
      program: result.program,
      stage: 'Researching',
      fitScore: result.fitScore,
      nextAction: result.nextAction,
      due: result.due,
      location: result.location
    });
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-border bg-card p-6 shadow-[0_24px_50px_rgba(15,23,42,0.08)] transition-colors">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Search results</p>
            <h1 className="text-3xl font-semibold text-foreground">
              {normalizedQuery ? `Matches for “${query}”` : 'Preview how universities align with your fit signals.'}
            </h1>
            <p className="text-sm text-muted-foreground">
              This grid is populated with placeholders—the final experience will pull from matches and shortlisted choices.
            </p>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              {hasNoMatches ? 'No matches found' : `${results.length} result${results.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <div className="rounded-[24px] border border-border bg-muted/70 px-6 py-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Shortlist</p>
            <p className="text-3xl font-semibold text-foreground">{shortlist.length}</p>
            <p className="text-xs text-muted-foreground">Universities</p>
          </div>
        </div>
      </section>

      <section className="space-y-6 rounded-[32px] border border-border bg-card p-6 shadow-[0_24px_50px_rgba(15,23,42,0.08)] transition-colors">
        {hasNoMatches ? (
          <div className="rounded-[28px] border border-dashed border-border bg-muted/60 p-10 text-center text-muted-foreground">
            We couldn&apos;t find any placeholder matches for “{query}”. Try another keyword or reset your filters.
          </div>
        ) : (
          groupedResults.map(
            ({ tier, matches }) =>
              matches.length > 0 && (
                <div key={tier} className="space-y-5">
                  <div className="flex flex-col gap-2 border-b border-border pb-3">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Tier</p>
                      <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]', TIER_BADGE_STYLES[tier])}>
                        {tier}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-2xl font-semibold text-foreground">{tier} programs</h2>
                      <p className="text-sm text-muted-foreground">{TIER_DESCRIPTIONS[tier]}</p>
                    </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {matches.map((result) => {
                      const isShortlisted = shortlist.some((item) => item.id === result.id);
                      return (
                        <article
                          key={`${result.name}-${result.program}`}
                          className="flex h-full flex-col rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">fit score</p>
                            <span className="text-2xl font-semibold text-foreground">{result.fitScore}%</span>
                          </div>
                          <div className="mt-4 flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-muted" aria-hidden />
                            <div>
                              <p className="text-lg font-semibold text-foreground">{result.name}</p>
                              <p className="text-sm text-muted-foreground">{result.program}</p>
                              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{result.location}</p>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {result.highlights.map((highlight) => (
                              <span key={highlight} className="rounded-full border border-border px-3 py-1 text-[11px]">
                                {highlight}
                              </span>
                            ))}
                          </div>
                          <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2 lg:grid-cols-3">
                            <Button asChild size="sm" variant="default" className="w-full justify-center">
                              <Link href={`/course/${result.id}?from=search`}>Course details</Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="w-full justify-center"
                              onClick={() => handleAdd(result)}
                              disabled={isShortlisted}
                            >
                              {isShortlisted ? 'Shortlisted' : 'Add to shortlist'}
                            </Button>
                            <Button asChild size="sm" variant="outline" className="w-full justify-center">
                              <Link href={`/university-search/university/${result.id}?from=search`}>University info</Link>
                            </Button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )
          )
        )}
      </section>
    </div>
  );
}
