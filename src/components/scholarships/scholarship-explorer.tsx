'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trackEvent } from '@/lib/analytics';
import type { Scholarship } from './types';
import { filterScholarships } from './utils';

interface ScholarshipExplorerProps {
  scholarships: Scholarship[];
}

export const ScholarshipExplorer = ({ scholarships }: ScholarshipExplorerProps) => {
  const [country, setCountry] = useState('');
  const [level, setLevel] = useState('');
  const [query, setQuery] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const countries = useMemo(() => Array.from(new Set(scholarships.map((item) => item.country).filter(Boolean))) as string[], [scholarships]);
  const levels = useMemo(
    () => Array.from(new Set(scholarships.map((item) => item.level ?? 'Any level'))).sort(),
    [scholarships]
  );

  const filtered = useMemo(
    () =>
      filterScholarships(scholarships, {
        country,
        level: level === 'Any level' ? undefined : level,
        query,
        maxAmount: maxAmount ? Number(maxAmount) : null
      }),
    [scholarships, country, level, query, maxAmount]
  );

  const resetFilters = () => {
    setCountry('');
    setLevel('');
    setQuery('');
    setMaxAmount('');
  };

  const handleSave = (scholarship: Scholarship) => {
    trackEvent('scholarship_saved', { scholarshipId: scholarship.id });
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-[28px] border border-border bg-card p-5 transition-colors">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-foreground">Search</span>
            <Input
              placeholder="Merit, STEM, regional..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
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
                <option key={item} value={item as string}>
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
            <Label htmlFor="amount-filter">Max award (USD)</Label>
            <Input
              id="amount-filter"
              type="number"
              placeholder="50000"
              value={maxAmount}
              onChange={(event) => setMaxAmount(event.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{filtered.length} scholarships</span>
          <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
            Reset filters
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
            No scholarships match these filters. Try widening your search.
          </div>
        ) : (
          filtered.map((scholarship) => (
            <article
              key={scholarship.id}
              className="rounded-[28px] border border-border bg-card p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
                    {scholarship.category ?? 'General'}
                  </p>
                  <h3 className="text-xl font-semibold text-foreground">{scholarship.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {scholarship.country ?? scholarship.region ?? 'Global'} • {scholarship.level ?? 'Any level'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-foreground">
                    {scholarship.currency ?? 'USD'} {scholarship.amount?.toLocaleString() ?? '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">Deadline {scholarship.deadline ?? 'Rolling'}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button type="button" size="sm" onClick={() => handleSave(scholarship)}>
                  Save to tracker
                </Button>
                {scholarship.url ? (
                  <Button asChild type="button" size="sm" variant="outline">
                    <a href={scholarship.url} target="_blank" rel="noreferrer">
                      View details
                    </a>
                  </Button>
                ) : null}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
};
