import { AnimatedBlobBanner } from '@/components/animated-blob-banner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const interestPills = ['AI labs', 'Global cities', 'Scholarships', 'STEM-heavy', 'Portfolio-friendly'];

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
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-8 shadow-[0_30px_60px_rgba(15,23,42,0.08)]">
        <AnimatedBlobBanner className="opacity-80" />
        <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1fr),320px]">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Search hub</p>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold text-slate-900">Cue up your next university discover session.</h1>
              <p className="text-base text-slate-600">
                Drop a keyword, layer filters, and preview how well each program syncs with your profile before you meet a counselor.
              </p>
            </div>
            <div className="space-y-3 rounded-[28px] border border-slate-200 bg-white/80 p-4 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
              <label htmlFor="search-keyword" className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                keyword search
              </label>
              <div className="flex flex-col gap-3 lg:flex-row">
                <Input
                  id="search-keyword"
                  placeholder="Search by university, course, or vibe"
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-slate-900 placeholder:text-slate-400"
                />
                <Button size="sm" className="lg:self-start">
                  Start scouting
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {interestPills.map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    className="rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 transition hover:border-slate-900 hover:text-slate-900"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.1)]">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              <span>Preview match</span>
              <span>Beta</span>
            </div>
            <div className="mt-5 flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-200" aria-hidden />
              <div>
                <p className="text-lg font-semibold text-slate-900">Harvard University</p>
                <p className="text-sm text-slate-500">Computational Design</p>
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">fit score</p>
                <p className="text-2xl font-semibold text-slate-900">92%</p>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>• Portfolio ready; aligns with your design internship history.</li>
                <li>• Entry requirements match your predicted IB scores.</li>
                <li>• Flagged interview prep window in mid-November.</li>
              </ul>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {['Studio vibe', 'Scholarship friendly', 'Urban campus'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-2 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Filter universities</p>
          <h2 className="text-2xl font-semibold text-slate-900">Tune the signals to surface better matches.</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {filterGroups.map((group) => (
            <div
              key={group.title}
              className="space-y-3 rounded-[28px] border border-slate-100 bg-slate-50/60 p-5 shadow-[0_14px_25px_rgba(15,23,42,0.05)]"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{group.title}</p>
                <p className="text-sm text-slate-600">{group.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="rounded-full border border-slate-200 bg-white px-4 py-1 text-sm font-semibold text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            These filters don’t run a live query yet—they help counselors understand what to curate next for you.
          </p>
          <div className="flex gap-3">
            <button type="button" className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              Reset filters
            </button>
            <Button size="sm">Apply filters</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
