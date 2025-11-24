'use client';

import { useMemo, useState } from 'react';
import { UniversityCard } from '@/components/university-card';
import { FilterBar } from '@/components/university-search/FilterBar';
import type { MatchTier } from '@/lib/matching/engine';
import { cn } from '@/lib/utils';
import { useShortlist } from '@/components/university-search/shortlist-store';

export interface EnrichedMatch {
  program: {
    id: string;
    name: string;
    field?: string | null;
    level?: string | null;
    language?: string | null;
    mode?: string | null;
    tuition?: number | null;
    currency?: string | null;
    url?: string | null;
  };
  university: {
    id: string;
    name: string;
    country: string;
    rank_overall?: number | null;
    rank_source?: string | null;
  };
  score: number;
  breakdown: {
    eligibility: number;
    academicFit: number;
    preferenceFit: number;
    outcomes: number;
  };
  blockingReasons: string[];
  tier: MatchTier;
}

interface MatchListProps {
  matches: EnrichedMatch[];
}

const TIER_ORDER: MatchTier[] = ['Reach', 'Match', 'Safe'];
const TIER_DESCRIPTIONS: Record<MatchTier, string> = {
  Reach: 'Highly selective universities that stretch your profile.',
  Match: 'Programs that align closely with your academic and preference fit.',
  Safe: 'Comfortable options where you exceed the entry expectations.'
};

export const MatchList = ({ matches }: MatchListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTiers, setSelectedTiers] = useState<MatchTier[]>(['Reach', 'Match', 'Safe']);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { items: shortlist, addItem, removeItem } = useShortlist();

  const filtered = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();
    return matches.filter((match) => {
      const matchesSearch =
        !normalizedQuery ||
        `${match.program.name} ${match.university.name} ${match.university.country}`.toLowerCase().includes(normalizedQuery);
      const matchesTier = selectedTiers.includes(match.tier);
      return matchesSearch && matchesTier;
    });
  }, [matches, searchQuery, selectedTiers]);

  const tierGroups = useMemo(() => {
    const accumulator: Record<MatchTier, EnrichedMatch[]> = {
      Reach: [],
      Match: [],
      Safe: []
    };
    filtered.forEach((match) => {
      accumulator[match.tier].push(match);
    });
    return TIER_ORDER.map((tier) => ({ tier, matches: accumulator[tier] }));
  }, [filtered]);

  const handleToggleShortlist = (match: EnrichedMatch) => {
    const isShortlisted = shortlist.some((item) => item.id === match.program.id);
    if (isShortlisted) {
      removeItem(match.program.id);
    } else {
      addItem({
        id: match.program.id,
        name: match.university.name,
        program: match.program.name,
        stage: 'Researching',
        fitScore: match.score,
        nextAction: 'Review program details',
        due: 'TBD',
        location: match.university.country
      });
    }
  };

  return (
    <div className="space-y-8">
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTiers={selectedTiers}
        onTierChange={(tier) => {
          setSelectedTiers((prev) =>
            prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
          );
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        resultCount={filtered.length}
      />

      <section className="space-y-6">
        {filtered.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-border bg-muted/60 p-10 text-center text-muted-foreground">
            No matches found. Try adjusting your filters.
          </div>
        ) : (
          tierGroups.map(({ tier, matches }) =>
            matches.length ? (
              <div
                key={tier}
                className="space-y-5 rounded-[32px] border border-border bg-card p-6 shadow-[0_24px_50px_rgba(15,23,42,0.08)] transition-colors"
              >
                <div className="flex flex-col gap-2 border-b border-border pb-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Tier</p>
                    <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-foreground">
                      {tier}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-2xl font-semibold text-foreground">{tier} programs</h3>
                    <p className="text-sm text-muted-foreground">{TIER_DESCRIPTIONS[tier]}</p>
                  </div>
                </div>

                <div
                  className={cn(
                    'grid gap-6',
                    viewMode === 'grid'
                      ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                      : 'grid-cols-1'
                  )}
                >
                  {matches.map((match) => (
                    <UniversityCard
                      key={match.program.id}
                      id={match.program.id}
                      name={match.university.name}
                      program={match.program.name}
                      location={match.university.country}
                      fitScore={match.score}
                      tier={match.tier}
                      highlights={[
                        match.program.level ?? 'Program',
                        match.program.language ?? 'English'
                      ].filter(Boolean)}
                      variant={viewMode === 'list' ? 'compact' : 'default'}
                      isShortlisted={shortlist.some((item) => item.id === match.program.id)}
                      onToggleShortlist={() => handleToggleShortlist(match)}
                    />
                  ))}
                </div>
              </div>
            ) : null
          )
        )}
      </section>
    </div>
  );
};
