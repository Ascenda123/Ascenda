'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MatchTier } from '@/lib/matching/engine';
import { useShortlist } from '@/components/university-search/shortlist-store';
import { UniversityCard } from '@/components/university-card';
import { FilterBar } from '@/components/university-search/FilterBar';
import { CompareBar } from '@/components/university-search/CompareBar';
import { ComparisonModal } from '@/components/university-search/ComparisonModal';
import { cn } from '@/lib/utils';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';
import { ProgramSearchResult, tierFromScore } from '@/components/university-search/types';
import { Suggestion } from '@/components/university-search/IntelligentSearchBar';

import { Breadcrumbs } from '@/components/ui/breadcrumbs';

const DEMO_PROGRAM_IDS = new Set(['44444444-4444-4444-4444-444444444444']);

type ProgramRow = {
  id: string;
  name: string;
  field?: string | null;
  level?: string | null;
  duration_years?: number | null;
  language?: string | null;
  tuition?: number | null;
  currency?: string | null;
  universities?: {
    name?: string | null;
    country?: string | null;
    city?: string | null;
    region?: string | null;
    acceptance_rate?: number | null;
    requires_test?: boolean | null;
    intl_tuition_low?: number | null;
    intl_tuition_high?: number | null;
    currency?: string | null;
  } | null;
};

export default function UniversitySearchResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programId = searchParams.get('programId');
  const universityId = searchParams.get('universityId');

  const initialQuery = searchParams.get('q')?.trim() ?? '';

  // State
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedTiers, setSelectedTiers] = useState<MatchTier[]>(['Reach', 'Match', 'Safe']);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedForComparison, setSelectedForComparison] = useState<ProgramSearchResult[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [quickFilters, setQuickFilters] = useState({
    budgetFriendly: false,
    englishOnly: false,
    testOptional: false
  });
  const [results, setResults] = useState<ProgramSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { items: shortlist, addItem, removeItem } = useShortlist();
  // Load catalog results from Supabase
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const supabase = getBrowserSupabaseClient();

        // Base query
        let query = supabase
          .from('programs')
          .select(
            `
            id,
            name,
            field,
            level,
            duration_years,
            language,
            tuition,
            currency,
            universities!inner (
              id,
              name,
              country,
              city,
              region,
              acceptance_rate,
              requires_test,
              intl_tuition_low,
              intl_tuition_high,
              currency
            )
          `
          );

        // Apply ID filters if present
        if (programId) {
          query = query.eq('id', programId);
        }
        if (universityId) {
          query = query.eq('universities.id', universityId);
        }

        // If no specific ID, limit results
        if (!programId && !universityId) {
          query = query.limit(200);
        }

        const [{ data: sessionData }, { data, error: supabaseError }] = await Promise.all([
          supabase.auth.getSession(),
          query
        ]);

        if (supabaseError) throw supabaseError;

        const userId = sessionData?.session?.user?.id;
        let matchScores: Record<string, number> = {};

        if (userId) {
          const { data: matches, error: matchError } = await supabase
            .from('student_matches')
            .select('program_id, score')
            .eq('profile_id', userId);
          if (matchError) {
            console.error('Failed to load match scores', matchError);
          } else {
            matchScores =
              matches?.reduce<Record<string, number>>((acc, entry) => {
                const numericScore =
                  typeof entry.score === 'string'
                    ? Number.parseFloat(entry.score)
                    : typeof entry.score === 'number'
                      ? entry.score
                      : null;
                if (numericScore !== null && Number.isFinite(numericScore)) {
                  acc[entry.program_id] = numericScore;
                }
                return acc;
              }, {}) ?? {};
          }
        }

        const mapped =
          data
            ?.filter((program: ProgramRow) => !DEMO_PROGRAM_IDS.has(program.id))
            .map((program: ProgramRow) => {
              const uni = program.universities;
              const location = [uni?.city, uni?.region, uni?.country].filter(Boolean).join(', ');
              const score = matchScores[program.id];
              const tier = tierFromScore(score);
              return {
                id: program.id,
                universityId: (uni as any)?.id,
                universityName: uni?.name ?? 'University',
                programName: program.name,
                location: location || 'Location unavailable',
                fitScore: score ?? null,
                tier: tier ?? null,
                highlights: [program.field, program.level].filter(Boolean) as string[],
                acceptanceRate: uni?.acceptance_rate ?? null,
                durationYears: program.duration_years ?? null,
                tuition: program.tuition ?? null,
                currency: program.currency ?? uni?.currency ?? null,
                intlTuitionLow: uni?.intl_tuition_low ?? null,
                intlTuitionHigh: uni?.intl_tuition_high ?? null,
                language: program.language ?? null,
                requiresTest: uni?.requires_test ?? null
              };
            }) ?? [];

        setResults(mapped);

        // Sync Filters with URL IDs
        if (programId && mapped.length > 0) {
          const program = mapped[0];
          setSearchQuery(''); // Clear text search
          setSelectedPrograms([program.programName]);
          setSelectedUniversities([program.universityName]);
        } else if (universityId && mapped.length > 0) {
          const uniName = mapped[0].universityName;
          setSearchQuery(''); // Clear text search
          setSelectedUniversities([uniName]);
        }

      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : 'Unable to load results';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [programId, universityId]); // Re-fetch if IDs change

  const availableUniversities = useMemo(() => {
    const source =
      selectedPrograms.length > 0
        ? results.filter((result) => selectedPrograms.includes(result.programName))
        : results;

    const names = new Set<string>();
    source.forEach((result) => names.add(result.universityName));
    selectedUniversities.forEach((name) => names.add(name));
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [results, selectedPrograms, selectedUniversities]);

  const availablePrograms = useMemo(() => {
    const source =
      selectedUniversities.length > 0
        ? results.filter((result) => selectedUniversities.includes(result.universityName))
        : results;

    const programs = new Set<string>();
    source.forEach((result) => programs.add(result.programName));
    selectedPrograms.forEach((program) => programs.add(program));
    return Array.from(programs).sort((a, b) => a.localeCompare(b));
  }, [results, selectedPrograms, selectedUniversities]);

  const filteredResults = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();
    const isBudgetFriendly = (result: ProgramSearchResult) => {
      const tuition = result.tuition ?? result.intlTuitionLow ?? null;
      if (tuition === null) return false;
      return tuition <= 40000;
    };
    const isEnglishOnly = (result: ProgramSearchResult) => {
      if (!result.language) return false;
      return result.language.toLowerCase().includes('english');
    };
    const isTestOptional = (result: ProgramSearchResult) => result.requiresTest === false;

    return results.filter((result) => {
      const matchesSearch =
        !normalizedQuery ||
        `${result.universityName} ${result.programName} ${result.location}`.toLowerCase().includes(normalizedQuery);
      const matchesTier = result.tier ? selectedTiers.includes(result.tier) : true;
      const matchesUniversity =
        selectedUniversities.length === 0 || selectedUniversities.includes(result.universityName);
      const matchesProgram =
        selectedPrograms.length === 0 || selectedPrograms.includes(result.programName);
      const matchesBudget = !quickFilters.budgetFriendly || isBudgetFriendly(result);
      const matchesLanguage = !quickFilters.englishOnly || isEnglishOnly(result);
      const matchesTesting = !quickFilters.testOptional || isTestOptional(result);
      return (
        matchesSearch &&
        matchesTier &&
        matchesUniversity &&
        matchesProgram &&
        matchesBudget &&
        matchesLanguage &&
        matchesTesting
      );
    });
  }, [results, searchQuery, selectedTiers, selectedPrograms, selectedUniversities, quickFilters]);

  const handleToggleUniversity = (name: string) => {
    // If we are un-toggling the university that is currently filtering the page via URL,
    // we should remove the URL filter to allow dynamic expansion of results.
    if (universityId && selectedUniversities.includes(name) && selectedUniversities.length === 1) {
      // Check if the name matches the current ID-based university (we'd need to know the name from results)
      // A simpler heuristic: if there's a universityId param, and we are toggling off the only selected university,
      // it's likely the one from the URL.
      const params = new URLSearchParams(searchParams.toString());
      params.delete('universityId');
      params.delete('q'); // Clear fallback query too
      router.push(`/university-search/results?${params.toString()}`);
    }

    setSelectedUniversities((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handleToggleProgram = (program: string) => {
    // Similar logic for programs
    if (programId && selectedPrograms.includes(program) && selectedPrograms.length === 1) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('programId');
      params.delete('q');
      router.push(`/university-search/results?${params.toString()}`);
    }

    setSelectedPrograms((prev) =>
      prev.includes(program) ? prev.filter((item) => item !== program) : [...prev, program]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTiers(['Reach', 'Match', 'Safe']);
    setSelectedUniversities([]);
    setSelectedPrograms([]);
    setQuickFilters({
      budgetFriendly: false,
      englishOnly: false,
      testOptional: false
    });

    // If there are URL params, clear them to truly reset
    if (programId || universityId || searchParams.get('q')) {
      router.push('/university-search/results');
    }
  };

  const handleSelectSuggestion = (item: Suggestion) => {
    setSearchQuery(item.name);

    const params = new URLSearchParams();
    if (item.university) {
      // It's a program
      params.set('programId', item.id);
      params.set('q', `${item.name} ${item.university}`);
    } else {
      // It's a university
      params.set('universityId', item.id);
      params.set('q', item.name);
    }

    router.push(`/university-search/results?${params.toString()}`);
  };

  // Handlers
  const handleToggleShortlist = (result: ProgramSearchResult) => {
    const isShortlisted = shortlist.some((item) => item.id === result.id);
    if (isShortlisted) {
      removeItem(result.id);
    } else {
      addItem({
        id: result.id,
        name: result.universityName,
        program: result.programName,
        fitScore: result.fitScore,
        location: result.location
      });
    }
  };

  const handleToggleSelect = (result: ProgramSearchResult) => {
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
    <div className="min-h-screen space-y-8 pb-24" >
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
          onSelectSuggestion={handleSelectSuggestion}
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
          selectedUniversities={selectedUniversities}
          selectedPrograms={selectedPrograms}
          availableUniversities={availableUniversities}
          availablePrograms={availablePrograms}
          onUniversityToggle={handleToggleUniversity}
          onProgramToggle={handleToggleProgram}
          onClearFilters={handleResetFilters}
        />

        {isLoading ? (
          <div className="rounded-[32px] border border-border bg-muted/20 p-6 text-sm text-muted-foreground">
            Loading catalog results…
          </div>
        ) : error ? (
          <div className="rounded-[32px] border border-dashed border-red-300 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-border bg-muted/30 py-20 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground">No matches found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search query to find more results.
            </p>
            <button
              onClick={handleResetFilters}
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
                name={result.universityName}
                program={result.programName}
                location={result.location}
                fitScore={result.fitScore}
                tier={result.tier ?? undefined}
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
