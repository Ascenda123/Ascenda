'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedBlobBanner } from '@/components/animated-blob-banner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { IntelligentSearchBar, Suggestion } from '@/components/university-search/IntelligentSearchBar';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';

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

  const handleSelectSuggestion = (item: Suggestion) => {
    setSearchQuery(item.name);

    const params = new URLSearchParams();
    if (item.university) {
      // It's a program
      params.set('programId', item.id);
      params.set('q', `${item.name} ${item.university}`); // Fallback/Context
    } else {
      // It's a university
      params.set('universityId', item.id);
      params.set('q', item.name); // Fallback/Context
    }

    router.push(`/university-search/results?${params.toString()}`);
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
              action="/university-search/results"
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
