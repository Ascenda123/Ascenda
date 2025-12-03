'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { AnimatedBlobBanner } from '@/components/animated-blob-banner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';

type Suggestion = {
  id: string;
  name: string;
  university?: string | null;
  location?: string | null;
  score: number;
};

type SuggestionGroups = {
  programs: Suggestion[];
  universities: Suggestion[];
};

const filterGroups = [
  {
    title: 'Country',
    description: 'Where do you picture yourself living?',
    options: ['USA', 'UK', 'Canada', 'Australia', 'Singapore']
  },
  {
    title: 'Subject',
    description: 'Pick the themes you want to explore.',
    options: ['Computer Science', 'Engineering', 'Design', 'Business', 'Humanities']
  },
  {
    title: 'Fit focus',
    description: 'Dial in what matters most for you.',
    options: ['Career outcomes', 'Research focus', 'Campus feel', 'Internships', 'Cost']
  },
  {
    title: 'Lifestyle',
    description: 'Choose the energy you vibe with.',
    options: ['City', 'Coastal', 'Suburban', 'Tight-knit', 'Global hub']
  }
];

export default function UniversitySearchPage() {
  const router = useRouter();
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionGroups>({ programs: [], universities: [] });
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const blurTimeoutRef = useRef<number | null>(null);

  const toggleFilter = (option: string) => {
    const next = new Set(selectedFilters);
    if (next.has(option)) {
      next.delete(option);
    } else {
      next.add(option);
    }
    setSelectedFilters(next);
  };

  const resetFilters = () => {
    setSelectedFilters(new Set());
  };

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

        // Parallelize queries for better performance
        // 1. Search Programs by name
        // 2. Search Universities by name
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

        if (programsRes.error) {
          console.warn('Program search error:', programsRes.error);
        }
        if (universitiesRes.error) {
          console.warn('University search error:', universitiesRes.error);
        }

        const normalizedQuery = trimmed.toLowerCase();

        // Scoring helper
        const scoreText = (value: string | null | undefined) => {
          if (!value) return 0;
          const lower = value.toLowerCase();
          if (lower === normalizedQuery) return 100;
          if (lower.startsWith(normalizedQuery)) return 90;
          if (lower.includes(` ${normalizedQuery}`)) return 80; // Word boundary match
          if (lower.includes(normalizedQuery)) return 60;
          return 0;
        };

        const programSuggestions = (programsRes.data || []).map((program: any) => {
          const uni = program.universities as { name?: string | null; city?: string | null; region?: string | null; country?: string | null } | null;
          const location = [uni?.city, uni?.region, uni?.country].filter(Boolean).join(', ') || null;

          const nameScore = scoreText(program.name);
          const fieldScore = scoreText(program.field);
          // Boost score if the university name also matches
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
    debounceRef.current = window.setTimeout(() => fetchSuggestions(searchQuery), 150);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  const hasSuggestions = useMemo(
    () => suggestions.programs.length > 0 || suggestions.universities.length > 0,
    [suggestions]
  );

  const handleSelectSuggestion = (item: Suggestion) => {
    let query = item.name;
    // If it's a program and has a university, combine them for a more specific search result
    if (item.university) {
      query = `${item.name} ${item.university}`;
    }

    setSearchQuery(query);
    setIsDropdownOpen(false);

    // Navigate immediately
    router.push(`/university-search/results?q=${encodeURIComponent(query)}`);
  };

  const handleBlur = () => {
    blurTimeoutRef.current = window.setTimeout(() => setIsDropdownOpen(false), 80);
  };

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      window.clearTimeout(blurTimeoutRef.current);
    }
    setIsDropdownOpen(true);
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-border bg-gradient-to-br from-background to-muted/70 p-8 shadow-[0_30px_60px_rgba(15,23,42,0.08)]">
        <AnimatedBlobBanner className="opacity-80" />
        <div className="relative z-10 space-y-8">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Search hub</p>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold text-foreground">Cue up your next university discover session.</h1>
              <p className="text-base text-muted-foreground">
                Drop a keyword, layer filters, and preview how well each program syncs with your profile before you meet a counselor.
              </p>
            </div>
            <form
              action="/university-search/results"
              className="space-y-3 rounded-[28px] border border-border bg-card/90 p-4 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur"
            >
              <label htmlFor="search-keyword" className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                universities or courses
              </label>
              <div className="space-y-3">
                <div className="relative flex w-full items-center gap-3 rounded-full border border-border bg-background px-6 py-3 shadow-[0_18px_35px_rgba(15,23,42,0.08)] focus-within:border-foreground/60">
                  <Search className="h-5 w-5 text-muted-foreground" aria-hidden />
                  <Input
                    id="search-keyword"
                    name="q"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="Search universities or courses by name, subject, or vibe"
                    className="h-16 flex-1 border-0 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                  />
                  {isDropdownOpen && (hasSuggestions || isLoadingSuggestions) ? (
                    <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                      {isLoadingSuggestions ? (
                        <p className="px-3 py-2 text-xs text-muted-foreground">Finding matches…</p>
                      ) : (
                        <div className="max-h-72 divide-y divide-border overflow-y-auto">
                          {suggestions.programs.length > 0 ? (
                            <div>
                              <p className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Programs</p>
                              <ul className="p-1">
                                {suggestions.programs.map((item) => (
                                  <li key={`program-${item.id}`}>
                                    <button
                                      type="button"
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => handleSelectSuggestion(item)}
                                      className="flex w-full flex-col rounded-xl px-3 py-2 text-left text-sm transition hover:bg-muted"
                                    >
                                      <span className="font-semibold text-foreground">{item.name}</span>
                                      {item.university ? (
                                        <span className="text-xs text-muted-foreground">{item.university}</span>
                                      ) : null}
                                      {item.location ? <span className="text-xs text-muted-foreground">{item.location}</span> : null}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                          {suggestions.universities.length > 0 ? (
                            <div>
                              <p className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Universities</p>
                              <ul className="p-1">
                                {suggestions.universities.map((item) => (
                                  <li key={`university-${item.id}`}>
                                    <button
                                      type="button"
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => handleSelectSuggestion(item)}
                                      className="flex w-full flex-col rounded-xl px-3 py-2 text-left text-sm transition hover:bg-muted"
                                    >
                                      <span className="font-semibold text-foreground">{item.name}</span>
                                      {item.location ? <span className="text-xs text-muted-foreground">{item.location}</span> : null}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
                <Button size="lg" className="w-full" type="submit" variant="soft">
                  Search
                </Button>
              </div>
            </form>
          </div>

        </div>
      </section>

      <section className="rounded-[32px] border border-border bg-card p-6 shadow-[0_24px_50px_rgba(15,23,42,0.08)] transition-colors">
        <div className="flex flex-col gap-2 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Filter universities</p>
          <h2 className="text-2xl font-semibold text-foreground">Tune the signals to surface better matches.</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {filterGroups.map((group) => (
            <div
              key={group.title}
              className="space-y-3 rounded-[28px] border border-border bg-muted/60 p-5 shadow-[0_14px_25px_rgba(15,23,42,0.05)] transition-colors"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{group.title}</p>
                <p className="text-sm text-muted-foreground">{group.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => {
                  const isSelected = selectedFilters.has(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleFilter(option)}
                      className={cn(
                        'rounded-full border px-4 py-1 text-sm font-semibold transition',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                          : 'border-border bg-background text-foreground hover:border-foreground/60 hover:text-foreground'
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            These filters don’t run a live query yet—they help counselors understand what to curate next for you.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset filters
            </button>
            <Button size="sm">Apply filters</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
