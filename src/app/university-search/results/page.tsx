import { Button } from '@/components/ui/button';

const placeholderResults = [
  {
    name: 'Harvard University',
    program: 'Computational Design',
    location: 'Cambridge, USA',
    fitScore: 92,
    highlights: ['Studio-based learning', 'Research mentorship', 'Portfolio review']
  },
  {
    name: 'Stanford University',
    program: 'Engineering & Society',
    location: 'Palo Alto, USA',
    fitScore: 88,
    highlights: ['Silicon Valley immersion', 'Entrepreneurship minor', 'Campus incubator']
  },
  {
    name: 'University of Oxford',
    program: 'Philosophy & Politics',
    location: 'Oxford, UK',
    fitScore: 85,
    highlights: ['Tutorial model', 'Collegiate community', 'Essay-focused']
  },
  {
    name: 'ETH Zürich',
    program: 'Robotics & AI',
    location: 'Zürich, Switzerland',
    fitScore: 83,
    highlights: ['Lab rotations', 'Co-op terms', 'German immersion']
  },
  {
    name: 'National University of Singapore',
    program: 'Global Business',
    location: 'Singapore',
    fitScore: 80,
    highlights: ['Southeast Asia markets', 'Dual degree pathways', 'City campus']
  },
  {
    name: 'University of Toronto',
    program: 'Data Science',
    location: 'Toronto, Canada',
    fitScore: 78,
    highlights: ['Co-op placements', 'Urban campus', 'AI research hub']
  }
];

export default function UniversitySearchResultsPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Search results</p>
            <h1 className="text-3xl font-semibold text-slate-900">Preview how universities align with your fit signals.</h1>
            <p className="text-sm text-slate-500">
              This grid is populated with placeholders—the final experience will pull from matches and shortlisted choices.
            </p>
          </div>
          <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 px-6 py-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Shortlist</p>
            <p className="text-3xl font-semibold text-slate-900">0</p>
            <p className="text-xs text-slate-500">Universities</p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {placeholderResults.map((result) => (
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
                <Button size="sm" className="w-full sm:w-auto">
                  Add to shortlist
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
