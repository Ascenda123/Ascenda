import { Button } from '@/components/ui/button';

const shortlist = [
  {
    name: 'Yale University',
    program: 'Ethics, Politics & Economics',
    stage: 'Researching',
    fitScore: 88,
    nextAction: 'Schedule counselor debrief to prioritize essays.',
    due: 'Plan by May 12'
  },
  {
    name: 'University of Melbourne',
    program: 'Design + Innovation',
    stage: 'Shortlisted',
    fitScore: 84,
    nextAction: 'Confirm portfolio pieces and prep storytelling video.',
    due: 'Upload draft by May 24'
  },
  {
    name: 'HKUST',
    program: 'Global Business',
    stage: 'Active',
    fitScore: 81,
    nextAction: 'Line up teacher recommendations and test scores.',
    due: 'Locker synced by June 02'
  }
];

export default function UniversitySearchShortlistPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Shortlist</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Hold your strongest contenders with next actions.</h1>
        <p className="text-sm text-slate-500">
          This view will sync with counselor recommendations soon. For now, it demonstrates how stages, fit, and momentum prompts will appear.
        </p>
      </section>

      <section className="space-y-4 rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
        {shortlist.map((school) => (
          <article
            key={`${school.name}-${school.program}`}
            className="flex flex-col gap-6 rounded-[28px] border border-slate-100 bg-slate-50/60 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:flex-row md:items-center"
          >
            <div className="flex flex-1 items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-200" aria-hidden />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">{school.stage}</p>
                <p className="text-lg font-semibold text-slate-900">{school.name}</p>
                <p className="text-sm text-slate-500">{school.program}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-left md:w-48 md:text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">fit</p>
              <p className="text-3xl font-semibold text-slate-900">{school.fitScore}%</p>
              <p className="text-xs text-slate-500">{school.due}</p>
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Next action</p>
              <p className="text-sm text-slate-600">{school.nextAction}</p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" variant="soft">
                  View plan
                </Button>
                <Button size="sm" variant="outline">
                  Share with counselor
                </Button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
