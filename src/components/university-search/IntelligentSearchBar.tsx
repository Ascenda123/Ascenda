'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';

export type Suggestion = {
    id: string;
    name: string;
    university?: string | null;
    location?: string | null;
    score: number;
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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const debounceRef = useRef<number | null>(null);
    const blurTimeoutRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchSuggestions = async (query: string) => {
            const trimmed = query.trim();
            if (trimmed.length === 0) {
                setSuggestions({ programs: [], universities: [] });
                return;
            }
            setIsLoadingSuggestions(true);
            try {
                const supabase = getBrowserSupabaseClient();

                const [programsRes, universitiesRes] = await Promise.all([
                    supabase
                        .from('programs')
                        .select('id,name,field,universities!inner(name,country,city,region)')
                        .ilike('name', `%${trimmed}%`)
                        .limit(5),
                    supabase
                        .from('universities')
                        .select('id,name,country,city,region')
                        .ilike('name', `%${trimmed}%`)
                        .limit(5)
                ]);

                if (programsRes.error) console.warn('Program search error:', programsRes.error);
                if (universitiesRes.error) console.warn('University search error:', universitiesRes.error);

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

                const programSuggestions = (programsRes.data || []).map((program: any) => {
                    const uni = program.universities as { name?: string | null; city?: string | null; region?: string | null; country?: string | null } | null;
                    const location = [uni?.city, uni?.region, uni?.country].filter(Boolean).join(', ') || null;
                    const nameScore = scoreText(program.name);
                    const fieldScore = scoreText(program.field);
                    const uniScore = scoreText(uni?.name) * 0.5;
                    const score = Math.max(nameScore, fieldScore) + uniScore;

                    return {
                        id: program.id,
                        name: program.name,
                        university: uni?.name ?? null,
                        location,
                        score
                    };
                });

                const universitySuggestions = (universitiesRes.data || []).map((uni: any) => {
                    const location = [uni.city, uni.region, uni.country].filter(Boolean).join(', ') || null;
                    const score = scoreText(uni.name);
                    return {
                        id: uni.id,
                        name: uni.name,
                        location,
                        score
                    };
                });

                const sortByScore = (items: Suggestion[]) => [...items].sort((a, b) => b.score - a.score).slice(0, 5);

                setSuggestions({
                    programs: sortByScore(programSuggestions),
                    universities: sortByScore(universitySuggestions)
                });
            } catch (err) {
                console.error('Failed to load suggestions', err);
                setSuggestions({ programs: [], universities: [] });
            } finally {
                setIsLoadingSuggestions(false);
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
        };
    }, [value]);

    const hasSuggestions = useMemo(
        () => suggestions.programs.length > 0 || suggestions.universities.length > 0,
        [suggestions]
    );

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
        onSelectSuggestion(item);
    };

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

            {isDropdownOpen && (hasSuggestions || isLoadingSuggestions) && (
                <div className={cn(
                    "absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl",
                    variant === 'default' ? "top-full" : "top-full"
                )}>
                    {isLoadingSuggestions ? (
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
                    )}
                </div>
            )}
        </div>
    );
}
