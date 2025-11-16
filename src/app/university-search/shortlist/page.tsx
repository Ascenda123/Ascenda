'use client';

import { Button } from '@/components/ui/button';
import { useShortlist } from '@/components/university-search/shortlist-store';

export default function UniversitySearchShortlistPage() {
  const { items: shortlist } = useShortlist();

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
        {shortlist.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
            <p className="text-lg font-semibold text-slate-900">No universities pinned yet</p>
            <p className="text-sm text-slate-500">Head to the results tab and tap “Add to shortlist” to see them here.</p>
          </div>
        ) : (
          shortlist.map((school) => (
          <article
            key={school.id}
            className="flex flex-col gap-6 rounded-[28px] border border-slate-100 bg-slate-50/60 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:flex-row md:items-center"
          >
            <div className="flex flex-1 items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-200" aria-hidden />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">{school.stage}</p>
                <p className="text-lg font-semibold text-slate-900">{school.name}</p>
                <p className="text-sm text-slate-500">{school.program}</p>
                {school.location && <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{school.location}</p>}
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
          ))
        )}
      </section>
    </div>
  );
}
