'use client';

import { FilterBar } from '@/components/university-search/FilterBar';
import { MatchTier } from '@/lib/matching/engine';

const SkeletonCard = () => (
  <div className="h-48 animate-pulse rounded-[24px] border border-border bg-muted/60" />
);

export default function MatchesLoading() {
  return (
    <div className="space-y-6 p-4">
      <div className="h-8 w-48 rounded-full bg-muted" />
      <FilterBar
        searchQuery=""
        onSearchChange={() => {}}
        selectedTiers={['Reach', 'Match', 'Safe'] as MatchTier[]}
        onTierChange={() => {}}
        viewMode="grid"
        onViewModeChange={() => {}}
        resultCount={0}
        quickFilters={{ budgetFriendly: false, englishOnly: false, testOptional: false }}
        onQuickFilterChange={() => {}}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <SkeletonCard key={item} />
        ))}
      </div>
    </div>
  );
}
