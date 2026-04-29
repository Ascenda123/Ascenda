'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { MatchTier } from '@/lib/matching/match-tier';
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
import { buildSearchResultsUrl, buildSuggestionResultsUrl } from '@/lib/university-search/search-params';
import type { Database } from '@/lib/types/database';

import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';

type StudentMatchRow = Database['public']['Tables']['student_matches']['Row'];

type ProgramRow = {
  id: string;
  university_id?: string | null;
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
    metadata?: Record<string, unknown> | null;
  } | null;
};

type FilterOption = {
  programName: string;
  universityName: string;
};

const PROGRAM_FILTER_LIMIT = 2000;

const getFlaggedProgramIds = () => {
  const fromEnv =
    process.env.NEXT_PUBLIC_FLAGGED_PROGRAM_IDS ??
    process.env.NEXT_PUBLIC_DEMO_PROGRAM_IDS ??
    process.env.DEMO_PROGRAM_IDS ??
    '';
  return fromEnv
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
};

const applyProgramVisibilityFilters = (
  query: any,
  flaggedIds: string[]
) => {
  if (!flaggedIds.length) return query;
  const formatted = flaggedIds.map((id) => `"${id}"`).join(',');
  return query.not('id', 'in', `(${formatted})`);
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
  // Store all unique universities directly from the DB to ensure the filter list is complete
  const [allUniversities, setAllUniversities] = useState<{ id: string; name: string }[]>([]);
  const [results, setResults] = useState<ProgramSearchResult[]>([]);
  const [resultCount, setResultCount] = useState(0);
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
        const response = await fetch('/api/search/filters', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to load filters (${response.status})`);
        }
        const body: { programs: { programName: string; universityId?: string | null }[]; universities: { id: string; name: string }[] } = await response.json();

        if (!isActive) return;

        const universities = (body.universities ?? []).filter((u) => u.name);
        setAllUniversities(universities);

        const mapped: FilterOption[] = (body.programs ?? [])
          .filter((entry) => entry.programName && entry.universityId)
          .map((entry) => {
            const universityName =
              universities.find((u) => u.id === entry.universityId)?.name ?? 'University';
            return { universityName, programName: entry.programName };
          });

        const uniqueMap = new Map<string, FilterOption>();
        mapped.forEach((item) => {
          const key = `${item.universityName}|${item.programName}`;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
          }
        });

        const dedupedListeners = Array.from(uniqueMap.values());

        setFilterOptions(dedupedListeners);
      } catch (err) {
        console.error('Failed to fetch filters:', err);
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
  // Reset pagination when filters change
  useEffect(() => {
    setResults([]);
    setPage(0);
    setHasMore(true);
  }, [programId, universityId, selectedUniversities, selectedPrograms, searchQuery]);

  // If all filters and search are cleared, remove any lingering URL params so we fetch full results.
  useEffect(() => {
    const noSelections =
      selectedPrograms.length === 0 &&
      selectedUniversities.length === 0;
    const noSearch = searchQuery.trim() === '';
    const hasUrlFilters = programId || universityId || searchParams.get('q');

    if (noSelections && noSearch && hasUrlFilters) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('programId');
      params.delete('universityId');
      params.delete('q');
      const next = params.toString();
      router.replace(next ? `/university-search/results?${next}` : '/university-search/results');
    }
  }, [
    programId,
    universityId,
    searchParams,
    selectedPrograms.length,
    selectedUniversities.length,
    searchQuery,
    router
  ]);

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
        const flaggedIds = getFlaggedProgramIds();

        // Base query
        // We always use the 'universities' inner join to get location/tuition details
        // and to allow filtering by university name.
        let query = applyProgramVisibilityFilters(
          supabase
            .from('programs')
            .select(
              `
            *,
            universities!left (
              id,
              name,
              country,
              city,
              region,
              acceptance_rate,
              requires_test,
              intl_tuition_low,
              intl_tuition_high,
              currency,
              metadata
            )
          `,
              { count: 'exact' }
            ),
          flaggedIds
        );

        // 1. URL ID Filters (Initial Load priority, but often synced to state)
        // If we have selectedUniversities/Programs state, that takes precedence over raw IDs
        // because the state is initialized from IDs anyway.
        // So we strictly use the STATE for filtering if populated, or fallback to IDs if state is empty (rare delay).

        const activeUniFilters = selectedUniversities.length > 0 ? selectedUniversities : [];
        const activeProgFilters = selectedPrograms.length > 0 ? selectedPrograms : [];

        if (activeUniFilters.length > 0) {
          const selectedUniIds = activeUniFilters
            .map((name) => allUniversities.find((u) => u.name === name)?.id)
            .filter((id): id is string => Boolean(id));

          if (selectedUniIds.length > 0) {
            query = query.in('university_id', selectedUniIds);
          } else {
            // Fallback to name-based filter if IDs are not yet available.
            query = query.in('universities.name', activeUniFilters);
          }
        } else if (universityId && activeUniFilters.length === 0) {
          // Fallback to ID if state not yet synced/empty
          query = query.eq('university_id', universityId);
        }

        if (activeProgFilters.length > 0) {
          query = query.in('course_name', activeProgFilters);
        } else if (programId && activeProgFilters.length === 0) {
          query = query.eq('id', programId);
        }

        // 2. Text Search
        // Only apply fuzzy text search if we haven't already selected a specific item via ID
        // (If provided by ID, the text query is likely the name of that item, which might not match 'course_name')
        const sanitizeSearchValue = (value: string) =>
          value.replace(/[(),%_]/g, ' ').replace(/\s+/g, ' ').trim();

        const safeSearchQuery = sanitizeSearchValue(searchQuery);

        if (safeSearchQuery && !programId && !universityId) {
          // Complex Logic: Find IDs of universities matching the name
          const normalizedQ = safeSearchQuery.toLowerCase();
          const matchedUniIds = allUniversities
            .filter(u => u.name?.toLowerCase().includes(normalizedQ))
            .map(u => u.id)
            .slice(0, 50); // Limit to 50 to avoid massive URLs

          // Construct OR query
          // course_name ILIKE query OR university_id IN (matches)
          if (matchedUniIds.length > 0) {
            // Use the simplified syntax avoiding joined table reference
            query = query.or(`course_name.ilike.%${safeSearchQuery}%,university_id.in.(${matchedUniIds.join(',')})`);
          } else {
            query = query.ilike('course_name', `%${safeSearchQuery}%`);
          }
        }

        // Pagination
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        query = query.range(from, to);

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
            const matchRows = matches ?? [];
            matchScores = matchRows.reduce<Record<string, number>>((acc, entry) => {
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
          const uniId = (uni?.id ?? program.university_id) ?? undefined;
          const uniName =
            typeof uni?.name === 'string' && uni.name?.trim()
              ? uni.name.trim()
              : uniId
                ? allUniversities.find((u) => u.id === uniId)?.name ?? null
                : null;
          const uniMetadata =
            uni && typeof uni.metadata === 'object' && uni.metadata !== null ? (uni.metadata as Record<string, unknown>) : {};
          const logoUrl =
            typeof uniMetadata.logo_url === 'string'
              ? (uniMetadata.logo_url as string)
              : typeof uniMetadata.logoUrl === 'string'
                ? (uniMetadata.logoUrl as string)
                : undefined;
          const location = [uni?.city, uni?.region, uni?.country].filter(Boolean).join(', ');
          const score = matchScores[program.id];
          const tier = tierFromScore(score);
          const programName = program.course_name ?? program.name ?? 'Program';
          const level = program.study_level ?? program.level ?? null;
          const duration = program.duration ?? (program.duration_years ? `${program.duration_years} years` : null);
          return {
            id: program.id,
            universityId: uniId,
            universityName: uniName ?? 'University',
            programName,
            location: location || 'Location unavailable',
            logoUrl: logoUrl ?? null,
            fitScore: score ?? null,
            tier: tier ?? null,
            highlights: [level, duration].filter(Boolean) as string[],
            acceptanceRate: uni?.acceptance_rate ?? null,
            duration: duration ?? null,
            intlTuitionLow: uni?.intl_tuition_low ?? null,
            intlTuitionHigh: uni?.intl_tuition_high ?? null,
            requiresTest: uni?.requires_test ?? null,
            tuition: program.tuition ?? null,
            currency: program.currency ?? uni?.currency ?? null,
            studyLevel: level
          };
        });

        setResults((prev) => {
          if (isFirstPage) return mapped;
          const existingIds = new Set(prev.map((item) => item.id));
          const incoming = mapped.filter((item) => !existingIds.has(item.id));
          return [...prev, ...incoming];
        });

        const pageCount = mapped.length;
        // Check if we hit the total count or if the page returned less than full size
        if (typeof count === 'number') {
          // 'count' from Supabase is total matching records
          const loadedSoFar = (page + 1) * PAGE_SIZE; // Approximation, better to track cumulative? 
          // Actually 'results.length' + current batch
          // Supabase range is inclusive. 
          // If we have count, we rely on it.
          // But 'results' state resets on filter change.
          // So simply:
          const totalFetched = (page * PAGE_SIZE) + pageCount;
          setHasMore(totalFetched < count);
          setResultCount(count);
        } else {
          setHasMore(pageCount === PAGE_SIZE);
        }

        // Sync local filters with URL ID only on very first visual load if empty
        // logic moved to separate effect or handled implicitly by precedence
        if (isFirstPage && selectedUniversities.length === 0 && selectedPrograms.length === 0) {
          // We only sync if we used the IDs to filter.
          if (programId && mapped.length > 0) {
            const p = mapped[0];
            // Note: Calling setState inside useEffect might trigger re-run if dependencies include it.
            // But we guard with 'length === 0'.
            setSelectedPrograms([p.programName]);
            setSelectedUniversities([p.universityName]);
          } else if (universityId && mapped.length > 0) {
            setSelectedUniversities([mapped[0].universityName]);
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
  }, [page, programId, universityId, selectedUniversities, selectedPrograms, searchQuery, allUniversities]);

  const availableUniversities = useMemo(() => {
    // Use the full universities list from Supabase (not the capped filterOptions)
    const names = new Set<string>();
    allUniversities.forEach((uni) => names.add(uni.name));
    selectedUniversities.forEach((name) => names.add(name));
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [allUniversities, selectedUniversities]);

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
    const hasExplicitIdFilter = Boolean(programId || universityId);

    return results.filter((result) => {
      const matchesSearch =
        hasExplicitIdFilter ||
        !normalizedQuery ||
        `${result.universityName} ${result.programName} ${result.location}`.toLowerCase().includes(normalizedQuery) ||
        // Fallback: if server sent it, it likely matched via ID or special logic
        (allUniversities.find(u => u.id === result.universityId)?.name?.toLowerCase().includes(normalizedQuery) ?? false);
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
  }, [
    results,
    searchQuery,
    selectedTiers,
    selectedPrograms,
    selectedUniversities,
    allUniversities,
    programId,
    universityId
  ]);

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
    setResults([]);
    setPage(0);
    setHasMore(true);
    setResultCount(0);
    setError(null);

    // If there are URL params, clear them to truly reset
    if (programId || universityId || searchParams.get('q')) {
      router.push('/university-search/results');
    }
  };

  const handleSelectSuggestion = (item: Suggestion) => {
    setSearchQuery(item.name);
    // Reset previous manual selections so the new choice takes full effect.
    if (item.type === 'university') {
      setSelectedUniversities([item.name]);
      setSelectedPrograms([]);
    } else {
      setSelectedPrograms([item.name]);
      setSelectedUniversities(item.university ? [item.university] : []);
    }
    setResults([]);
    setPage(0);
    router.push(buildSuggestionResultsUrl(item));
  };

  const handleSearchSubmit = () => {
    router.push(buildSearchResultsUrl(searchQuery));
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
          onSearchSubmit={handleSearchSubmit}
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
          <div className="rounded-[28px] border border-dashed border-red-300 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-border bg-muted/30 py-20 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground">No matches found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or add one more detail to your profile to unlock matches.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm font-semibold">
              <Button asChild size="sm" variant="outline" className="rounded-full px-4">
                <Link href="/profile/wizard?step=academic_details">Add your grades</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full px-4">
                <Link href="/profile/wizard?step=lifestyle_preferences">Set your preferences</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full px-4">
                <Link href="/profile/wizard?step=academic_input">Clarify goals & interests</Link>
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
                logoUrl={result.logoUrl ?? undefined}
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
