'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ProgramCard } from './program-card';
import { ScoreBadge } from './score-badge';
import type { MatchTier } from '@/lib/matching/engine';

export interface EnrichedMatch {
  program: {
    id: string;
    name: string;
    field?: string | null;
    level?: string | null;
    language?: string | null;
    mode?: string | null;
    tuition?: number | null;
    currency?: string | null;
    url?: string | null;
  };
  university: {
    id: string;
    name: string;
    country: string;
    rank_overall?: number | null;
    rank_source?: string | null;
  };
  score: number;
  breakdown: {
    eligibility: number;
    academicFit: number;
    preferenceFit: number;
    outcomes: number;
  };
  blockingReasons: string[];
  tier: MatchTier;
}

interface MatchListProps {
  matches: EnrichedMatch[];
}

const TIER_ORDER: MatchTier[] = ['Reach', 'Match', 'Safe'];
const TIER_DESCRIPTIONS: Record<MatchTier, string> = {
  Reach: 'Highly selective universities that stretch your profile.',
  Match: 'Programs that align closely with your academic and preference fit.',
  Safe: 'Comfortable options where you exceed the entry expectations.'
};

export const MatchList = ({ matches }: MatchListProps) => {
  const [country, setCountry] = useState('');
  const [language, setLanguage] = useState('');
  const [level, setLevel] = useState('');
  const [maxTuition, setMaxTuition] = useState<string>('');

  const countries = useMemo(() => Array.from(new Set(matches.map((match) => match.university.country))).sort(), [matches]);
  const languages = useMemo(
    () =>
      Array.from(
        new Set(matches.map((match) => (match.program.language ? match.program.language : 'Unknown language')))
      ).sort(),
    [matches]
  );
  const levels = useMemo(
    () => Array.from(new Set(matches.map((match) => match.program.level ?? 'Unknown level'))).sort(),
    [matches]
  );

  const filtered = useMemo(() => {
    return matches.filter((match) => {
      if (country && match.university.country !== country) return false;
      if (language && (match.program.language ?? 'Unknown language') !== language) return false;
      if (level && (match.program.level ?? 'Unknown level') !== level) return false;
      if (maxTuition) {
        const limit = Number(maxTuition);
        if (!Number.isNaN(limit) && match.program.tuition && match.program.tuition > limit) {
          return false;
        }
      }
      return true;
    });
  }, [matches, country, language, level, maxTuition]);

  const tierGroups = useMemo(() => {
    const accumulator: Record<MatchTier, EnrichedMatch[]> = {
      Reach: [],
      Match: [],
      Safe: []
    };
    filtered.forEach((match) => {
      accumulator[match.tier].push(match);
    });
    return TIER_ORDER.map((tier) => ({ tier, matches: accumulator[tier] }));
  }, [filtered]);

  const activeFilters = [
    country ? { label: 'Country', value: country, onClear: () => setCountry('') } : null,
    language ? { label: 'Language', value: language, onClear: () => setLanguage('') } : null,
    level ? { label: 'Level', value: level, onClear: () => setLevel('') } : null,
    maxTuition ? { label: 'Budget', value: `≤ ${maxTuition}`, onClear: () => setMaxTuition('') } : null
  ].filter(Boolean) as { label: string; value: string; onClear: () => void }[];

  const resetFilters = () => {
    setCountry('');
    setLanguage('');
    setLevel('');
    setMaxTuition('');
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-[32px] border border-border bg-card p-5 text-foreground shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition-colors">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          <div>
            <Label htmlFor="country-filter">Country</Label>
            <select
              id="country-filter"
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
            >
              <option value="">All</option>
              {countries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="language-filter">Language</Label>
            <select
              id="language-filter"
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="">All</option>
              {languages.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="level-filter">Level</Label>
            <select
              id="level-filter"
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={level}
              onChange={(event) => setLevel(event.target.value)}
            >
              <option value="">All</option>
              {levels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="maxTuition">Max tuition</Label>
            <Input
              id="maxTuition"
              type="number"
              placeholder="e.g. 45000"
              value={maxTuition}
              onChange={(event) => setMaxTuition(event.target.value)}
              className="max-w-[190px]"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.length ? (
            <>
              {activeFilters.map((filter) => (
                <button
                  key={`${filter.label}-${filter.value}`}
                  type="button"
                  onClick={filter.onClear}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  <span className="text-muted-foreground">{filter.label}</span>
                  <span className="text-foreground">{filter.value}</span>
                  <span aria-hidden>✕</span>
                </button>
              ))}
              <Button size="sm" variant="ghost" onClick={resetFilters}>
                Reset filters
              </Button>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Apply filters to shape your shortlist. Fit Scores update instantly.</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
            No matches yet. Adjust your filters or update your profile for better suggestions.
          </div>
        ) : (
          tierGroups.map(({ tier, matches }) =>
            matches.length ? (
              <div
                key={tier}
                className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
              >
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Tier</p>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-2xl font-semibold text-slate-900">{tier}</h3>
                    <p className="text-sm text-slate-500">{TIER_DESCRIPTIONS[tier]}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {matches.map((match) => (
                    <ProgramCard
                      key={match.program.id}
                      program={match.program}
                      university={match.university}
                      scoreBadge={<ScoreBadge score={match.score} breakdown={match.breakdown} />}
                      tier={match.tier}
                    />
                  ))}
                </div>
              </div>
            ) : null
          )
        )}
      </section>
    </div>
  );
};
