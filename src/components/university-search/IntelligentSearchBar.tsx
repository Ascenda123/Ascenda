'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type Suggestion = {
    id: string;
    name: string;
    university?: string | null;
    location?: string | null;
    score: number;
    type: 'program' | 'university';
};

export type SuggestionGroups = {
    programs: Suggestion[];
    universities: Suggestion[];
};

interface IntelligentSearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSelectSuggestion: (item: Suggestion) => void;
    placeholder?: string;
    className?: string;
    inputClassName?: string;
    variant?: 'default' | 'minimal';
}

export function IntelligentSearchBar({
    value,
    onChange,
    onSelectSuggestion,
    placeholder = 'Search universities or courses...',
    className,
    inputClassName,
    variant = 'default'
}: IntelligentSearchBarProps) {
    const [suggestions, setSuggestions] = useState<SuggestionGroups>({ programs: [], universities: [] });
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isLoadingPrefill, setIsLoadingPrefill] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [recentSearches, setRecentSearches] = useState<Suggestion[]>([]);
    const [trendingSuggestions, setTrendingSuggestions] = useState<SuggestionGroups>({ programs: [], universities: [] });
    const debounceRef = useRef<number | null>(null);
    const blurTimeoutRef = useRef<number | null>(null);
    const latestRequestRef = useRef<number>(0);
    const activeRequests = useRef<AbortController[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const hasTypedQuery = value.trim().length > 0;

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const validateAndLoadRecents = async () => {
            try {
                const stored = window.localStorage.getItem('ascenda-recent-searches');
                if (!stored) return;
                const parsed = JSON.parse(stored) as Suggestion[];

                // Normalize legacy entries that may not have a type.
                const normalized = parsed.map((item) => ({
                    ...item,
                    type: item.type ?? (item.university ? 'program' : 'university')
                })) as Suggestion[];

                const validated: Suggestion[] = [];
                for (const entry of normalized) {
                    const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(entry.name)}`);
                    if (!response.ok) continue;
                    const payload = (await response.json()) as { programs: any[]; universities: any[] };
                    const exists =
                        entry.type === 'program'
                            ? (payload.programs || []).some((p) => p.id === entry.id)
                            : (payload.universities || []).some((u) => u.id === entry.id);

                    if (exists) {
                        validated.push(entry);
                    }
                }

                setRecentSearches(validated);
                window.localStorage.setItem('ascenda-recent-searches', JSON.stringify(validated));
            } catch (err) {
                console.warn('Unable to load recent searches', err);
            }
        };

        void validateAndLoadRecents();
    }, []);

    useEffect(() => {
        const fetchSuggestions = async (query: string) => {
            const trimmed = query.trim();
            if (trimmed.length < 2) {
                setSuggestions({ programs: [], universities: [] });
                setIsLoadingSuggestions(false);
                return;
            }
            setIsLoadingSuggestions(true);
            const requestId = Date.now();
            latestRequestRef.current = requestId;
            activeRequests.current.forEach((controller) => controller.abort());
            const controller = new AbortController();
            activeRequests.current = [controller];
            try {
                const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(trimmed)}`, {
                    signal: controller.signal
                });
                if (!response.ok) {
                    throw new Error(`Search failed: ${response.status}`);
                }
                const payload = (await response.json()) as { programs: any[]; universities: any[] };

                const normalizedQuery = trimmed.toLowerCase();

                const scoreText = (text: string | null | undefined) => {
                    if (!text) return 0;
                    const lower = text.toLowerCase();
                    if (lower === normalizedQuery) return 100;
                    if (lower.startsWith(normalizedQuery)) return 90;
                    if (lower.includes(` ${normalizedQuery}`)) return 80;
                    if (lower.includes(normalizedQuery)) return 60;
                    return 0;
                };

                const programSuggestions = (payload.programs || []).map((program: any) => {
                    const uni = program.universities as { name?: string | null; city?: string | null; region?: string | null; country?: string | null } | null;
                    const location = [uni?.city, uni?.region, uni?.country].filter(Boolean).join(', ') || null;
                    const nameScore = scoreText(program.course_name);
                    const levelScore = scoreText(program.study_level);
                    const uniScore = scoreText(uni?.name) * 0.5;
                    const score = Math.max(nameScore, levelScore) + uniScore;

                    return {
                        id: program.id,
                        name: program.course_name,
                        university: uni?.name ?? null,
                        location,
                        score,
                        type: 'program' as const
                    };
                });

                const universitySuggestions = (payload.universities || []).map((uni: any) => {
                    const location = [uni.city, uni.region, uni.country].filter(Boolean).join(', ') || null;
                    const score = scoreText(uni.name);
                    return {
                        id: uni.id,
                        name: uni.name,
                        location,
                        score,
                        type: 'university' as const
                    };
                });

                const sortByScore = (items: Suggestion[]) => [...items].sort((a, b) => b.score - a.score).slice(0, 5);

                if (latestRequestRef.current === requestId) {
                    setSuggestions({
                        programs: sortByScore(programSuggestions),
                        universities: sortByScore(universitySuggestions)
                    });
                }
            } catch (err) {
                console.error('Failed to load suggestions', err);
                if (latestRequestRef.current === requestId) {
                    setSuggestions({ programs: [], universities: [] });
                }
            } finally {
                if (latestRequestRef.current === requestId) {
                    setIsLoadingSuggestions(false);
                    activeRequests.current = [];
                }
            }
        };

        if (debounceRef.current) {
            window.clearTimeout(debounceRef.current);
        }
        debounceRef.current = window.setTimeout(() => fetchSuggestions(value), 150);

        return () => {
            if (debounceRef.current) {
                window.clearTimeout(debounceRef.current);
            }
            activeRequests.current.forEach((controller) => controller.abort());
            activeRequests.current = [];
        };
    }, [value]);

    useEffect(() => {
        if (!isDropdownOpen || hasTypedQuery || trendingSuggestions.programs.length + trendingSuggestions.universities.length > 0) {
            return;
        }
        let isActive = true;
        const loadTrending = async () => {
            setIsLoadingPrefill(true);
            try {
                const response = await fetch('/api/search/suggestions?trending=true');
                if (!response.ok) throw new Error('Trending fetch failed');
                const payload = (await response.json()) as { programs: any[]; universities: any[] };

                if (!isActive) return;

                const formatLocation = (city?: string | null, region?: string | null, country?: string | null) =>
                    [city, region, country].filter(Boolean).join(', ') || null;

                const programs = (payload.programs || []).map((program: any) => {
                    const uni = program.universities as { name?: string | null; city?: string | null; region?: string | null; country?: string | null } | null;
                    return {
                        id: program.id,
                        name: program.course_name,
                        university: uni?.name ?? null,
                        location: formatLocation(uni?.city ?? null, uni?.region ?? null, uni?.country ?? null),
                        score: 0,
                        type: 'program' as const
                    };
                });

                const universities = (payload.universities || []).map((uni: any) => ({
                    id: uni.id,
                    name: uni.name,
                    location: formatLocation(uni.city, uni.region, uni.country),
                    score: 0,
                    type: 'university' as const
                }));

                setTrendingSuggestions({ programs, universities });
            } catch (err) {
                console.warn('Unable to load trending suggestions', err);
            } finally {
                if (isActive) setIsLoadingPrefill(false);
            }
        };

        loadTrending();

        return () => {
            isActive = false;
        };
    }, [hasTypedQuery, isDropdownOpen, trendingSuggestions.programs.length, trendingSuggestions.universities.length]);

    const hasSuggestions = useMemo(
        () => suggestions.programs.length > 0 || suggestions.universities.length > 0,
        [suggestions]
    );

    const persistRecentSearch = (item: Suggestion) => {
        setRecentSearches((prev) => {
            const filtered = prev.filter((entry) => entry.id !== item.id);
            const next = [item, ...filtered].slice(0, 6);
            try {
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem('ascenda-recent-searches', JSON.stringify(next));
                }
            } catch (err) {
                console.warn('Unable to save recent search', err);
            }
            return next;
        });
    };

    const handleBlur = () => {
        blurTimeoutRef.current = window.setTimeout(() => setIsDropdownOpen(false), 200);
    };

    const handleFocus = () => {
        if (blurTimeoutRef.current) {
            window.clearTimeout(blurTimeoutRef.current);
        }
        setIsDropdownOpen(true);
    };

    const handleSelect = (item: Suggestion) => {
        onChange(item.name);
        setIsDropdownOpen(false);
        persistRecentSearch(item);
        onSelectSuggestion(item);
    };

    const hasPrefill = recentSearches.length > 0 || trendingSuggestions.programs.length > 0 || trendingSuggestions.universities.length > 0;
    const shouldShowDropdown = isDropdownOpen && (hasSuggestions || isLoadingSuggestions || !hasTypedQuery);

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <div className={cn(
                "relative flex w-full items-center gap-3",
                variant === 'default'
                    ? "rounded-full border border-border bg-background px-6 py-3 shadow-[0_18px_35px_rgba(15,23,42,0.08)] focus-within:border-foreground/60"
                    : "relative"
            )}>
                <Search className={cn(
                    "text-muted-foreground",
                    variant === 'default' ? "h-5 w-5" : "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                )} aria-hidden />
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className={cn(
                        variant === 'default'
                            ? "h-16 flex-1 border-0 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                            : "h-10 w-full rounded-xl border-border bg-background pl-9 pr-8",
                        inputClassName
                    )}
                />
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className={cn(
                            "text-muted-foreground hover:text-foreground",
                            variant === 'default' ? "" : "absolute right-3 top-1/2 -translate-y-1/2"
                        )}
                    >
                        <X className={cn(variant === 'default' ? "h-5 w-5" : "h-3 w-3")} />
                    </button>
                )}
            </div>

            {shouldShowDropdown && (
                <div className={cn(
                    "absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl",
                    variant === 'default' ? "top-full" : "top-full"
                )}>
                    {hasTypedQuery ? (
                        isLoadingSuggestions ? (
                            <p className="px-3 py-2 text-xs text-muted-foreground">Finding matches…</p>
                        ) : (
                            <div className="max-h-72 divide-y divide-border overflow-y-auto">
                                {suggestions.programs.length > 0 && (
                                    <div>
                                        <p className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Programs</p>
                                        <ul className="p-1">
                                            {suggestions.programs.map((item) => (
                                                <li key={`program-${item.id}`}>
                                                    <button
                                                        type="button"
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={() => handleSelect(item)}
                                                        className="flex w-full flex-col rounded-xl px-3 py-2 text-left text-sm transition hover:bg-muted"
                                                    >
                                                        <span className="font-semibold text-foreground">{item.name}</span>
                                                        {item.university && (
                                                            <span className="text-xs text-muted-foreground">{item.university}</span>
                                                        )}
                                                        {item.location && <span className="text-xs text-muted-foreground">{item.location}</span>}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {suggestions.universities.length > 0 && (
                                    <div>
                                        <p className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Universities</p>
                                        <ul className="p-1">
                                            {suggestions.universities.map((item) => (
                                                <li key={`university-${item.id}`}>
                                                    <button
                                                        type="button"
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={() => handleSelect(item)}
                                                        className="flex w-full flex-col rounded-xl px-3 py-2 text-left text-sm transition hover:bg-muted"
                                                    >
                                                        <span className="font-semibold text-foreground">{item.name}</span>
                                                        {item.location && <span className="text-xs text-muted-foreground">{item.location}</span>}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )
                    ) : (
                        <div className="space-y-2 p-3">
                            {isLoadingPrefill ? (
                                <p className="px-1 py-1 text-xs text-muted-foreground">Loading ideas…</p>
                            ) : hasPrefill ? (
                                <div className="space-y-3">
                                    {recentSearches.length > 0 && (
                                        <div>
                                            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Recent searches</p>
                                            <ul className="mt-1 grid gap-1 md:grid-cols-2">
                                                {recentSearches.map((item) => (
                                                    <li key={`recent-${item.id}`}>
                                                        <button
                                                            type="button"
                                                            onMouseDown={(e) => e.preventDefault()}
                                                            onClick={() => handleSelect(item)}
                                                            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-muted"
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-foreground">{item.name}</span>
                                                                {item.university && (
                                                                    <span className="text-xs text-muted-foreground">{item.university}</span>
                                                                )}
                                                                {item.location && <span className="text-xs text-muted-foreground">{item.location}</span>}
                                                            </div>
                                                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">Recent</span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {(trendingSuggestions.programs.length > 0 || trendingSuggestions.universities.length > 0) && (
                                        <div>
                                            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Trending</p>
                                            <div className="grid gap-2 md:grid-cols-2">
                                                {trendingSuggestions.programs.map((item) => (
                                                    <button
                                                        key={`trending-program-${item.id}`}
                                                        type="button"
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={() => handleSelect(item)}
                                                        className="flex w-full flex-col rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-left text-sm transition hover:border-foreground/60 hover:bg-muted"
                                                    >
                                                        <span className="font-semibold text-foreground">{item.name}</span>
                                                        {item.university && (
                                                            <span className="text-xs text-muted-foreground">{item.university}</span>
                                                        )}
                                                        {item.location && <span className="text-[11px] text-muted-foreground">{item.location}</span>}
                                                        <span className="mt-1 inline-flex w-fit rounded-full bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Program</span>
                                                    </button>
                                                ))}
                                                {trendingSuggestions.universities.map((item) => (
                                                    <button
                                                        key={`trending-university-${item.id}`}
                                                        type="button"
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={() => handleSelect(item)}
                                                        className="flex w-full flex-col rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-left text-sm transition hover:border-foreground/60 hover:bg-muted"
                                                    >
                                                        <span className="font-semibold text-foreground">{item.name}</span>
                                                        {item.location && <span className="text-[11px] text-muted-foreground">{item.location}</span>}
                                                        <span className="mt-1 inline-flex w-fit rounded-full bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">University</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="px-1 py-1 text-xs text-muted-foreground">Start typing to search, or pick from trending results.</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
