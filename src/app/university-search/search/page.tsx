'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { AnimatedBlobBanner } from '@/components/animated-blob-banner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getBrowserSupabaseClient } from '@/lib/supabase/client';

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
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [featuredProgram, setFeaturedProgram] = useState<{
    university: string;
    program: string;
    location: string;
  } | null>(null);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const supabase = getBrowserSupabaseClient();
        const { data, error } = await supabase
          .from('programs')
          .select(
            `
          name,
          universities (
            name,
            country,
            city,
            region
          )
        `
          )
          .not('id', 'eq', '44444444-4444-4444-4444-444444444444')
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const uni = (data as any).universities as { name?: string | null; country?: string | null; city?: string | null; region?: string | null } | null;
          const location = [uni?.city, uni?.region, uni?.country].filter(Boolean).join(', ');
          setFeaturedProgram({
            university: uni?.name ?? 'University catalog',
            program: data.name,
            location: location || 'Location unavailable'
          });
        } else {
          setFeaturedProgram(null);
        }
      } catch (loadError) {
        console.error('Failed to load featured program', loadError);
        setFeaturedProgram(null);
      }
    };

    loadFeatured();
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
                <div className="flex w-full items-center gap-3 rounded-full border border-border bg-background px-6 py-3 shadow-[0_18px_35px_rgba(15,23,42,0.08)] focus-within:border-foreground/60">
                  <Search className="h-5 w-5 text-muted-foreground" aria-hidden />
                  <Input
                    id="search-keyword"
                    name="q"
                    placeholder="Search universities or courses by name, subject, or vibe"
                    className="h-16 flex-1 border-0 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                  />
                </div>
                <Button size="lg" className="w-full" type="submit" variant="soft">
                  Search
                </Button>
              </div>
            </form>
          </div>

          <div className="rounded-[32px] border border-border bg-card p-6 shadow-[0_18px_45px_rgba(15,23,42,0.1)] transition-colors lg:flex lg:items-center lg:gap-8">
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                <span>Live catalog</span>
                <span>Supabase</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-muted" aria-hidden />
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {featuredProgram?.university ?? 'Catalog is syncing'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {featuredProgram?.program ?? 'Add programs in Supabase to see them here'}
                  </p>
                  {featuredProgram?.location ? (
                    <p className="text-xs text-muted-foreground">{featuredProgram.location}</p>
                  ) : null}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-muted/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Catalog status</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {featuredProgram ? 'Live data' : 'No catalog records yet'}
                  </p>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {featuredProgram
                    ? 'Preview pulled directly from Supabase. Start a search to see the full catalog.'
                    : 'Connect Supabase and add programs to surface them here.'}
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-1 flex-wrap gap-3 lg:mt-0 lg:justify-end">
              {(featuredProgram ? [featuredProgram.location] : ['Supabase connected', 'Add programs']).filter(Boolean).map((tag) => (
                <span key={tag} className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground">
                  {tag}
                </span>
              ))}
            </div>
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
