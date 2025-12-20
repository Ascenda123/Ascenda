'use client';

import { useEffect, useState, type FormEvent, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedBlobBanner } from '@/components/animated-blob-banner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { IntelligentSearchBar, Suggestion } from '@/components/university-search/IntelligentSearchBar';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';
import { buildSearchResultsUrl, buildSuggestionResultsUrl } from '@/lib/university-search/search-params';

const DEFAULT_FILTER_GROUPS = [
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
  const [filterGroups, setFilterGroups] = useState(DEFAULT_FILTER_GROUPS);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const uniqueSorted = (values: (string | null | undefined)[], limit = 12) =>
      Array.from(new Set(values.filter((value): value is string => Boolean(value && value.trim()))))
        .sort((a, b) => a.localeCompare(b))
        .slice(0, limit);

    const loadFilters = async () => {
      try {
        const supabase = getBrowserSupabaseClient();
        const [{ data: universityData, error: universityError }, { data: programData, error: programError }] = await Promise.all([
          supabase.from('universities').select('country,region,city'),
          supabase.from('programs').select('field,study_level,level,mode')
        ]);

        if (universityError || programError) {
          console.warn('Using fallback filters due to Supabase error', universityError ?? programError);
          return;
        }

        const countries = uniqueSorted((universityData ?? []).map((uni: any) => uni.country));
        const lifestyle = uniqueSorted(
          (universityData ?? []).flatMap((uni: any) => [uni.region, uni.city])
        );
        const subjects = uniqueSorted(
          (programData ?? []).flatMap((program: any) => [program.field, program.study_level, program.level])
        );
        const fitFocus = uniqueSorted(
          (programData ?? [])
            .map((program: any) => program.mode)
            .filter(Boolean),
          8
        );

        setFilterGroups([
          {
            ...DEFAULT_FILTER_GROUPS[0],
            options: countries.length ? countries : DEFAULT_FILTER_GROUPS[0].options
          },
          {
            ...DEFAULT_FILTER_GROUPS[1],
            options: subjects.length ? subjects : DEFAULT_FILTER_GROUPS[1].options
          },
          {
            ...DEFAULT_FILTER_GROUPS[2],
            options: fitFocus.length ? fitFocus : DEFAULT_FILTER_GROUPS[2].options
          },
          {
            ...DEFAULT_FILTER_GROUPS[3],
            options: lifestyle.length ? lifestyle : DEFAULT_FILTER_GROUPS[3].options
          }
        ]);
      } catch (err) {
        console.warn('Using fallback filters due to unexpected error', err);
      }
    };

    void loadFilters();
  }, []);

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

  const handleSubmit = (event?: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    router.push(buildSearchResultsUrl(searchQuery, selectedFilters));
  };

  const handleSelectSuggestion = (item: Suggestion) => {
    setSearchQuery(item.name);
    router.push(buildSuggestionResultsUrl(item));
  };



  return (
    <div className="space-y-8">
      <section className="relative z-20 rounded-[32px] border border-border bg-gradient-to-br from-background to-muted/70 p-8 shadow-[0_30px_60px_rgba(15,23,42,0.08)]">
        <div className="absolute inset-0 overflow-hidden rounded-[32px]">
          <AnimatedBlobBanner className="opacity-80" />
        </div>
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
              onSubmit={handleSubmit}
              className="space-y-3 rounded-[28px] border border-border bg-card/90 p-4 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur"
            >
              <label htmlFor="search-keyword" className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                universities or courses
              </label>
              <div className="space-y-3">
                <IntelligentSearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSelectSuggestion={handleSelectSuggestion}
                  inputId="search-keyword"
                  inputName="q"
                  placeholder="Search universities or courses by name, subject, or vibe"
                />
                <Button size="lg" className="w-full" type="submit" variant="soft">
                  Search
                </Button>
              </div>
            </form>
          </div>

        </div>
      </section>

      <section className="surface-card surface-card--static">
        <div className="flex flex-col gap-2 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Filter universities</p>
          <h2 className="text-2xl font-semibold text-foreground">Tune the signals to surface better matches.</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {filterGroups.map((group) => (
            <div
              key={group.title}
              className="surface-card surface-card--static space-y-3 bg-muted/70 p-5 shadow-none"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{group.title}</p>
                <p className="helper-text">{group.description}</p>
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
                        'rounded-full border px-4 py-1 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        isSelected
                          ? 'border-foreground/30 bg-foreground/5 text-foreground'
                          : 'border-border bg-background text-foreground hover:border-border hover:text-foreground'
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
          <p className="helper-text">
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
            <Button size="sm" type="button" onClick={handleSubmit}>Apply filters</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
