'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useShortlist } from '@/components/university-search/shortlist-store';

const placeholderResults = [
  {
    id: 'harvard-computational-design',
    name: 'Harvard University',
    program: 'Computational Design',
    location: 'Cambridge, USA',
    fitScore: 92,
    highlights: ['Studio-based learning', 'Research mentorship', 'Portfolio review'],
    nextAction: 'Flag portfolio pieces for counselor review.',
    due: 'Outline by May 20'
  },
  {
    id: 'stanford-engineering-society',
    name: 'Stanford University',
    program: 'Engineering & Society',
    location: 'Palo Alto, USA',
    fitScore: 88,
    highlights: ['Silicon Valley immersion', 'Entrepreneurship minor', 'Campus incubator'],
    nextAction: 'Draft note on why social impact matters to you.',
    due: 'Journal entry by May 18'
  },
  {
    id: 'oxford-phil-politics',
    name: 'University of Oxford',
    program: 'Philosophy & Politics',
    location: 'Oxford, UK',
    fitScore: 85,
    highlights: ['Tutorial model', 'Collegiate community', 'Essay-focused'],
    nextAction: 'Collect writing samples for tutorial preview.',
    due: 'Samples ready by May 25'
  },
  {
    id: 'eth-robotics-ai',
    name: 'ETH Zürich',
    program: 'Robotics & AI',
    location: 'Zürich, Switzerland',
    fitScore: 83,
    highlights: ['Lab rotations', 'Co-op terms', 'German immersion'],
    nextAction: 'Review language course options with counselor.',
    due: 'Plan session by May 30'
  },
  {
    id: 'nus-global-business',
    name: 'National University of Singapore',
    program: 'Global Business',
    location: 'Singapore',
    fitScore: 80,
    highlights: ['Southeast Asia markets', 'Dual degree pathways', 'City campus'],
    nextAction: 'Research internships in Singapore to cite interest.',
    due: 'Talking points by June 3'
  },
  {
    id: 'utoronto-data-science',
    name: 'University of Toronto',
    program: 'Data Science',
    location: 'Toronto, Canada',
    fitScore: 78,
    highlights: ['Co-op placements', 'Urban campus', 'AI research hub'],
    nextAction: 'List tech clubs to explore if admitted.',
    due: 'Club shortlist by June 8'
  }
];

export default function UniversitySearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';
  const normalizedQuery = query.toLowerCase();
  const { items: shortlist, addItem } = useShortlist();
  const results = normalizedQuery
    ? placeholderResults.filter((result) => {
        const haystack = `${result.name} ${result.program} ${result.location}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : placeholderResults;
  const hasNoMatches = normalizedQuery.length > 0 && results.length === 0;

  const handleAdd = (result: (typeof placeholderResults)[number]) => {
    addItem({
      id: result.id,
      name: result.name,
      program: result.program,
      stage: 'Researching',
      fitScore: result.fitScore,
      nextAction: result.nextAction,
      due: result.due,
      location: result.location
    });
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Search results</p>
            <h1 className="text-3xl font-semibold text-slate-900">
              {normalizedQuery ? `Matches for “${query}”` : 'Preview how universities align with your fit signals.'}
            </h1>
            <p className="text-sm text-slate-500">
              This grid is populated with placeholders—the final experience will pull from matches and shortlisted choices.
            </p>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
              {hasNoMatches ? 'No matches found' : `${results.length} result${results.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 px-6 py-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Shortlist</p>
            <p className="text-3xl font-semibold text-slate-900">{shortlist.length}</p>
            <p className="text-xs text-slate-500">Universities</p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
        {hasNoMatches ? (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center text-slate-500">
            We couldn&apos;t find any placeholder matches for “{query}”. Try another keyword or reset your filters.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {results.map((result) => {
              const isShortlisted = shortlist.some((item) => item.id === result.id);
              return (
                <article
                  key={`${result.name}-${result.program}`}
                  className="flex h-full flex-col rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)]"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">fit score</p>
                    <span className="text-2xl font-semibold text-slate-900">{result.fitScore}%</span>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-slate-200" aria-hidden />
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{result.name}</p>
                      <p className="text-sm text-slate-500">{result.program}</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{result.location}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {result.highlights.map((highlight) => (
                      <span key={highlight} className="rounded-full border border-slate-200 px-3 py-1 text-[11px]">
                        {highlight}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <Button size="sm" variant="soft" className="w-full sm:w-auto">
                      View details
                    </Button>
                    <Button
                      size="sm"
                      variant="soft"
                      className="w-full sm:w-auto"
                      onClick={() => handleAdd(result)}
                      disabled={isShortlisted}
                    >
                      {isShortlisted ? 'Shortlisted' : 'Add to shortlist'}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
