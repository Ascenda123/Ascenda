'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MatchTier } from '@/lib/matching/engine';
import { UniversityCard } from '@/components/university-card';
import { UniversityCardSkeleton } from '@/components/university-card-skeleton';
import { FilterBar } from '@/components/university-search/FilterBar';
import { CompareBar } from '@/components/university-search/CompareBar';
import { ComparisonModal } from '@/components/university-search/ComparisonModal';
import { cn } from '@/lib/utils';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';
import { ProgramSearchResult, tierFromScore } from '@/components/university-search/types';
import { Suggestion } from '@/components/university-search/IntelligentSearchBar';
import { filterVisiblePrograms } from '@/lib/catalog/visibility';
import type { Database } from '@/lib/types/database';

import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';

type StudentMatchRow = Database['public']['Tables']['student_matches']['Row'];

type ProgramRow = {
  id: string;
  course_name: string;
  name?: string | null;
  metadata?: Record<string, unknown> | null;
  study_level?: string | null;
  level?: string | null;
  duration?: string | null;
  duration_years?: number | null;
  start_date?: string | null;
  intake_months?: string[] | null;
  tuition?: number | null;
  currency?: string | null;
  universities?: {
    id?: string | null;
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

type FilterOption = {
  programName: string;
  universityName: string;
};

export default function UniversitySearchResultsPage() {
  const MAX_COMPARE_ITEMS = 5;
  const PAGE_SIZE = 50;
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
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [areFiltersLoading, setAreFiltersLoading] = useState(true);
  const [results, setResults] = useState<ProgramSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    setResults([]);
    setPage(0);
    setHasMore(true);
  }, [programId, universityId]);

  // Load available filter options directly from Supabase
  useEffect(() => {
    let isActive = true;

    const fetchFilters = async () => {
      try {
        const supabase = getBrowserSupabaseClient();
        const pageSize = 1000;
        let pageIndex = 0;
        const allPrograms: ProgramRow[] = [];

        // Fetch all programs in batches to ensure the dropdowns see the whole catalog
        // even when Supabase applies a default limit.
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const from = pageIndex * pageSize;
          const to = from + pageSize - 1;
          const { data, error: supabaseError } = await supabase
            .from('programs')
            .select(
              `
              id,
              course_name,
              name,
              metadata,
              universities!inner (
                name
              )
            `
            )
            .range(from, to);

          if (supabaseError) throw supabaseError;
          const batch = data ?? [];
          allPrograms.push(...batch);
          if (batch.length < pageSize) break;
          pageIndex += 1;
        }

        if (!isActive) return;

        const visiblePrograms = filterVisiblePrograms(allPrograms);
        const mapped: FilterOption[] = visiblePrograms
          .map((program) => {
            const universityName = program.universities?.name;
            const programName = program.course_name ?? program.name;
            if (!universityName || !programName) return null;
            return { universityName, programName };
          })
          .filter((item): item is FilterOption => Boolean(item));

        const deduped = Array.from(
          new Map(mapped.map((item) => [`${item.universityName}-${item.programName}`, item])).values()
        );

        setFilterOptions(deduped);
      } catch (filtersError) {
        console.error('Failed to load filter options', filtersError);
      } finally {
        if (isActive) {
          setAreFiltersLoading(false);
        }
      }
    };

    fetchFilters();

    return () => {
      isActive = false;
    };
  }, []);

  // Fallback: if filter options failed to load, derive from loaded results
  useEffect(() => {
    if (!areFiltersLoading && filterOptions.length === 0 && results.length > 0) {
      const derived = results.map((result) => ({
        programName: result.programName,
        universityName: result.universityName
      }));
      setFilterOptions(derived);
    }
  }, [areFiltersLoading, filterOptions.length, results]);
  // Load catalog results from Supabase
  useEffect(() => {
    const fetchResults = async () => {
      const isFirstPage = page === 0;
      if (isFirstPage) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }
      try {
        const supabase = getBrowserSupabaseClient();

        // Base query
        let query = supabase
          .from('programs')
          .select(
            `
            *,
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
          `,
            { count: programId || universityId ? undefined : 'exact' }
          );

        // Apply ID filters if present
        if (programId) {
          query = query.eq('id', programId);
        }
        if (universityId) {
          query = query.eq('universities.id', universityId);
        }

        // If no specific ID, paginate results
        if (!programId && !universityId) {
          const from = page * PAGE_SIZE;
          const to = from + PAGE_SIZE - 1;
          query = query.range(from, to);
        }

        const [{ data: sessionData }, { data, error: supabaseError, count }] = await Promise.all([
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
            const matchRows: StudentMatchRow[] = matches ?? [];
            matchScores = matchRows.reduce<Record<string, number>>((acc, entry: StudentMatchRow) => {
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
            }, {});
          }
        }

        const visiblePrograms = filterVisiblePrograms((data ?? []) as ProgramRow[]);

        const mapped: ProgramSearchResult[] = visiblePrograms.map((program: ProgramRow) => {
          const uni = program.universities;
          const location = [uni?.city, uni?.region, uni?.country].filter(Boolean).join(', ');
          const score = matchScores[program.id];
          const tier = tierFromScore(score);
          const programName = program.course_name ?? program.name ?? 'Program';
          const level = program.study_level ?? program.level ?? null;
          const duration = program.duration ?? (program.duration_years ? `${program.duration_years} years` : null);
          return {
            id: program.id,
            universityId: uni?.id ?? undefined,
            universityName: uni?.name ?? 'University',
            programName,
            location: location || 'Location unavailable',
            fitScore: score ?? null,
            tier: tier ?? null,
            highlights: [level, duration].filter(Boolean) as string[],
            acceptanceRate: uni?.acceptance_rate ?? null,
            duration: duration ?? null,
            intlTuitionLow: uni?.intl_tuition_low ?? null,
            intlTuitionHigh: uni?.intl_tuition_high ?? null,
            requiresTest: uni?.requires_test ?? null,
            tuition: program.tuition ?? null,
            currency: program.currency ?? uni?.currency ?? null
          };
        });

        setResults((prev) => {
          if (isFirstPage) return mapped;
          const existingIds = new Set(prev.map((item) => item.id));
          const incoming = mapped.filter((item) => !existingIds.has(item.id));
          return [...prev, ...incoming];
        });

        if (!programId && !universityId) {
          const pageCount = mapped.length;
          const loaded = page * PAGE_SIZE + pageCount;
          setHasMore(typeof count === 'number' ? loaded < count : pageCount === PAGE_SIZE);
        } else {
          setHasMore(false);
        }

        // Sync Filters with URL IDs on first page load
        if (isFirstPage) {
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
        }

      } catch (fetchError) {
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : typeof fetchError === 'object' && fetchError !== null && 'message' in fetchError
              ? String((fetchError as { message?: unknown }).message)
              : 'Unable to load results';
        setError(message || 'Unable to load results');
      } finally {
        if (isFirstPage) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    };

    fetchResults();
  }, [page, programId, universityId]);

  const availableUniversities = useMemo(() => {
    const source =
      selectedPrograms.length > 0
        ? filterOptions.filter((option) => selectedPrograms.includes(option.programName))
        : filterOptions;

    const names = new Set<string>();
    source.forEach((option) => names.add(option.universityName));
    selectedUniversities.forEach((name) => names.add(name));
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [filterOptions, selectedPrograms, selectedUniversities]);

  const availablePrograms = useMemo(() => {
    const source =
      selectedUniversities.length > 0
        ? filterOptions.filter((option) => selectedUniversities.includes(option.universityName))
        : filterOptions;

    const programs = new Set<string>();
    source.forEach((option) => programs.add(option.programName));
    selectedPrograms.forEach((program) => programs.add(program));
    return Array.from(programs).sort((a, b) => a.localeCompare(b));
  }, [filterOptions, selectedPrograms, selectedUniversities]);

  const filteredResults = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();

    return results.filter((result) => {
      const matchesSearch =
        !normalizedQuery ||
        `${result.universityName} ${result.programName} ${result.location}`.toLowerCase().includes(normalizedQuery);
      const matchesTier = result.tier ? selectedTiers.includes(result.tier) : true;
      const matchesUniversity =
        selectedUniversities.length === 0 || selectedUniversities.includes(result.universityName);
      const matchesProgram =
        selectedPrograms.length === 0 || selectedPrograms.includes(result.programName);
      return (
        matchesSearch &&
        matchesTier &&
        matchesUniversity &&
        matchesProgram
      );
    });
  }, [results, searchQuery, selectedTiers, selectedPrograms, selectedUniversities]);

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

  const handleLoadMore = () => {
    if (isLoading || isLoadingMore || !hasMore || programId || universityId) return;
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (programId || universityId) return;
    const target = loadMoreRef.current;
    if (!target || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoading && !isLoadingMore) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: '320px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, programId, universityId]);

  const handleToggleSelect = (result: ProgramSearchResult) => {
    setSelectedForComparison((prev) => {
      const isSelected = prev.some((item) => item.id === result.id);
      if (isSelected) {
        return prev.filter((item) => item.id !== result.id);
      } else {
        if (prev.length >= MAX_COMPARE_ITEMS) {
          // Optional: Show toast notification that max comparison is reached
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
          selectedUniversities={selectedUniversities}
          selectedPrograms={selectedPrograms}
          availableUniversities={availableUniversities}
          availablePrograms={availablePrograms}
          onUniversityToggle={handleToggleUniversity}
          onProgramToggle={handleToggleProgram}
          onClearFilters={handleResetFilters}
        />

        {isLoading ? (
          <div
            className={cn(
              'grid gap-6',
              viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
            )}
          >
            {Array.from({ length: viewMode === 'grid' ? 6 : 4 }).map((_, index) => (
              <UniversityCardSkeleton key={index} variant={viewMode === 'list' ? 'compact' : 'default'} />
            ))}
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
              Try adjusting your filters or add one more detail to your profile to unlock matches.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm font-semibold">
              <Button asChild size="sm" variant="outline" className="rounded-full px-4">
                <Link href="/profile?step=academics">Add your GPA</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full px-4">
                <Link href="/profile?step=preferences">Set your budget range</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full px-4">
                <Link href="/profile?step=aspirations">Clarify goals & interests</Link>
              </Button>
            </div>
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
                ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
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
                isSelected={selectedForComparison.some((item) => item.id === result.id)}
                onToggleSelect={() => handleToggleSelect(result)}
              />
            ))}
          </div>
        )}
        {hasMore && !isLoading && filteredResults.length > 0 && !programId && !universityId ? (
          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary disabled:cursor-not-allowed disabled:text-muted-foreground"
            >
              {isLoadingMore ? 'Loading more results…' : 'Load more results'}
            </button>
            <div ref={loadMoreRef} className="h-6 w-full" />
          </div>
        ) : null}
      </section>

      <CompareBar
        selectedItems={selectedForComparison}
        onClear={() => setSelectedForComparison([])}
        onRemove={(id) => setSelectedForComparison((prev) => prev.filter((item) => item.id !== id))}
        onCompare={handleCompare}
        maxItems={MAX_COMPARE_ITEMS}
      />

      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        universities={selectedForComparison}
        onRemove={(id) => setSelectedForComparison((prev) => prev.filter((i) => i.id !== id))}
        maxItems={MAX_COMPARE_ITEMS}
      />
    </div>
  );
}
