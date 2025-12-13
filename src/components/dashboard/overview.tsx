'use client';

import { cn } from '@/lib/utils';

export type HighlightTone = 'positive' | 'warning' | 'muted' | undefined;

export type HighlightCard = {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone?: HighlightTone;
};

export type FocusItem = {
  id: string;
  label: string;
  title: string;
  detail: string;
};

export interface OverviewPayload {
  highlightCards: HighlightCard[];
  focusItems: FocusItem[];
  nextStepTitle: string | null;
  todayFocus: {
    tasks: number;
    deadlines: number;
    interviews: number;
  };
}

const toneClass = (tone?: HighlightTone) =>
  tone === 'positive'
    ? 'border-emerald-300/60 bg-emerald-500/10'
    : tone === 'warning'
      ? 'border-amber-300/60 bg-amber-500/10'
      : tone === 'muted'
        ? 'border-border bg-muted/60'
    : 'border-border bg-muted/40';

export const DashboardOverview = ({ data }: { data: OverviewPayload }) => {
  const focusList = data.focusItems.slice(0, 4);

  return (
    <section className="surface-card surface-card--static space-y-8 text-foreground">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Overview</p>
          <h2 className="text-2xl font-semibold text-foreground">Calm control center</h2>
          <p className="text-sm text-muted-foreground">
            {data.nextStepTitle ? `${data.nextStepTitle} is the smartest next move.` : 'Everything is aligned. Keep momentum steady.'}
          </p>
        </div>
      </div>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.highlightCards.map((card) => (
            <div
              key={card.id}
              className={cn(
                'rounded-[20px] border p-5 text-foreground shadow-[0_25px_60px_-40px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-45px_rgba(0,0,0,0.38)]',
                toneClass(card.tone)
              )}
            >
              <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{card.value}</p>
              <p className="helper-text">{card.detail}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[24px] border border-border bg-gradient-to-br from-background to-muted/60 p-5 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.4)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Today</p>
              <p className="helper-text">Snapshot of what needs attention now.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
            {[
              { label: 'Tasks', value: data.todayFocus.tasks, detail: 'Due today' },
              { label: 'Deadlines', value: data.todayFocus.deadlines, detail: 'On radar' },
              { label: 'Interviews', value: data.todayFocus.interviews, detail: 'Prep slots' }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-card/70 p-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{item.value}</p>
                <p className="helper-text">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-border bg-card/80 p-5 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_35px_90px_-60px_rgba(0,0,0,0.45)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Focus radar</p>
              <p className="helper-text">Only the items that keep you moving.</p>
            </div>
          </div>
          <ul className="mt-4 space-y-4">
            {focusList.map((item) => (
              <li key={item.id} className="rounded-2xl border border-border bg-muted/60 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">{item.label}</p>
                <p className="text-base font-semibold text-foreground">{item.title}</p>
                <p className="helper-text">{item.detail}</p>
              </li>
            ))}
            {focusList.length === 0 ? (
              <li className="rounded-2xl border border-border bg-muted/60 p-4 text-sm text-muted-foreground">
                Nothing urgent right now. Keep logging progress or add programs to reveal new actions.
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </section>
  );
};
