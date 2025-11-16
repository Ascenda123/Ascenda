'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ProgramCard } from './program-card';
import { ScoreBadge } from './score-badge';

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
}

interface MatchListProps {
  matches: EnrichedMatch[];
}

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
      <section className="space-y-4 rounded-[32px] border border-[#e5e5e7] bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          <div>
            <Label htmlFor="country-filter">Country</Label>
            <select
              id="country-filter"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
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
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
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
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
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
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400"
                >
                  <span className="text-slate-400">{filter.label}</span>
                  <span className="text-slate-900">{filter.value}</span>
                  <span aria-hidden>✕</span>
                </button>
              ))}
              <Button size="sm" variant="ghost" onClick={resetFilters}>
                Reset filters
              </Button>
            </>
          ) : (
            <p className="text-xs text-slate-500">Apply filters to shape your shortlist. Fit Scores update instantly.</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
            No matches yet. Adjust your filters or update your profile for better suggestions.
          </div>
        ) : (
          filtered.map((match) => (
            <ProgramCard
              key={match.program.id}
              program={match.program}
              university={match.university}
              scoreBadge={<ScoreBadge score={match.score} breakdown={match.breakdown} />}
            />
          ))
        )}
      </section>
    </div>
  );
};
