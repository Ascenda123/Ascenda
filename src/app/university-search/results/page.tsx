'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MatchTier } from '@/lib/matching/engine';
import { useShortlist } from '@/components/university-search/shortlist-store';
import { placeholderResults, type PlaceholderResult } from '@/components/university-search/placeholder-results';
import { UniversityCard } from '@/components/university-card';
import { FilterBar } from '@/components/university-search/FilterBar';
import { CompareBar } from '@/components/university-search/CompareBar';
import { ComparisonModal } from '@/components/university-search/ComparisonModal';
import { cn } from '@/lib/utils';

import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export default function UniversitySearchResultsPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q')?.trim() ?? '';

  // State
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedTiers, setSelectedTiers] = useState<MatchTier[]>(['Reach', 'Match', 'Safe']);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedForComparison, setSelectedForComparison] = useState<PlaceholderResult[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [quickFilters, setQuickFilters] = useState({
    budgetFriendly: false,
    englishOnly: false,
    testOptional: false
  });

  const { items: shortlist, addItem, removeItem } = useShortlist();

  // Filter Results
  const filteredResults = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();
    return placeholderResults.filter((result) => {
      const matchesSearch =
        !normalizedQuery ||
        `${result.name} ${result.program} ${result.location}`.toLowerCase().includes(normalizedQuery);
      const matchesTier = selectedTiers.includes(result.tier);
      return matchesSearch && matchesTier;
    });
  }, [searchQuery, selectedTiers]);

  // Handlers
  const handleToggleShortlist = (result: PlaceholderResult) => {
    const isShortlisted = shortlist.some((item) => item.id === result.id);
    if (isShortlisted) {
      removeItem(result.id);
    } else {
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
    }
  };

  const handleToggleSelect = (result: PlaceholderResult) => {
    setSelectedForComparison((prev) => {
      const isSelected = prev.some((item) => item.id === result.id);
      if (isSelected) {
        return prev.filter((item) => item.id !== result.id);
      } else {
        if (prev.length >= 3) {
          // Optional: Show toast notification that max comparison is 3
          return prev;
        }
        return [...prev, result];
      }
    });
  };

  const handleCompare = () => {
    setIsComparisonOpen(true);
  };

  return (
    <div className="min-h-screen space-y-8 pb-24">
      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <Breadcrumbs className="mb-2" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">University Matches</h1>
          <p className="text-muted-foreground">
            Explore programs tailored to your profile and preferences.
          </p>
        </div>

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
          resultCount={filteredResults.length}
          quickFilters={quickFilters}
          onQuickFilterChange={(key) =>
            setQuickFilters((prev) => ({
              ...prev,
              [key]: !prev[key]
            }))
          }
        />

        {filteredResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-border bg-muted/30 py-20 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground">No matches found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search query to find more results.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTiers(['Reach', 'Match', 'Safe']);
              }}
              className="mt-4 text-sm font-medium text-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div
            className={cn(
              'grid gap-6',
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                : 'grid-cols-1'
            )}
          >
            {filteredResults.map((result) => (
              <UniversityCard
                key={result.id}
                id={result.id}
                name={result.name}
                program={result.program}
                location={result.location}
                fitScore={result.fitScore}
                tier={result.tier}
                highlights={result.highlights}
                isShortlisted={shortlist.some((item) => item.id === result.id)}
                isSelected={selectedForComparison.some((item) => item.id === result.id)}
                onToggleShortlist={() => handleToggleShortlist(result)}
                onToggleSelect={() => handleToggleSelect(result)}
              />
            ))}
          </div>
        )}
      </section>

      <CompareBar
        selectedItems={selectedForComparison}
        onClear={() => setSelectedForComparison([])}
        onRemove={(id) => setSelectedForComparison((prev) => prev.filter((item) => item.id !== id))}
        onCompare={handleCompare}
      />

      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        universities={selectedForComparison}
        onRemove={(id) => setSelectedForComparison((prev) => prev.filter((i) => i.id !== id))}
      />
    </div>
  );
}
