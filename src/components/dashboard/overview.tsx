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

export type OverviewStep = {
  key: string;
  title: string;
  description: string;
  complete: boolean;
};

export interface OverviewPayload {
  highlightCards: HighlightCard[];
  focusItems: FocusItem[];
  steps: OverviewStep[];
  completionPercent: number;
  completedSteps: number;
  averageMatchScore: number | null;
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
  return (
    <section className="space-y-6 rounded-[32px] border border-border bg-card p-6 text-foreground shadow-[0_25px_70px_rgba(15,23,42,0.08)] transition-colors">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Overview</p>
          <h2 className="text-2xl font-semibold text-foreground">Readiness snapshot</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {data.nextStepTitle ? `${data.nextStepTitle} is the next best action.` : 'Everything is synced—keep momentum going.'}
        </p>
      </div>
      <div className="grid gap-4 rounded-[24px] border border-border bg-muted/60 p-4 sm:grid-cols-3">
        {[
          { label: 'Tasks', value: data.todayFocus.tasks, detail: 'Due today' },
          { label: 'Deadlines', value: data.todayFocus.deadlines, detail: 'On your radar' },
          { label: 'Interviews', value: data.todayFocus.interviews, detail: 'Prep slots' }
        ].map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">{item.label}</p>
            <p className="text-3xl font-semibold text-foreground">{item.value}</p>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.highlightCards.map((card) => (
          <div key={card.id} className={cn('rounded-2xl p-4 text-foreground shadow-sm transition-colors', toneClass(card.tone))}>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">{card.value}</p>
            <p className="text-sm text-muted-foreground">{card.detail}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
        <div className="rounded-[24px] border border-border bg-card p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Profile completion</p>
              <p className="text-3xl font-semibold text-foreground">{data.completionPercent}%</p>
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {data.completedSteps} / {data.steps.length} steps
            </p>
          </div>
          <div className="mt-4 h-2 rounded-full bg-muted/60" aria-hidden>
            <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${data.completionPercent}%` }} />
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {data.steps.map((step) => (
              <div
                key={step.key}
                className="rounded-2xl border border-border bg-muted/50 p-4 shadow-[0_12px_25px_rgba(15,23,42,0.04)] transition-colors"
              >
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
                <p className={step.complete ? 'mt-3 text-sm font-semibold text-emerald-600' : 'mt-3 text-sm font-semibold text-amber-600'}>
                  {step.complete ? 'Complete' : 'Action needed'}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-border bg-card/90 p-5">
          <p className="text-sm font-semibold text-foreground">Focus radar</p>
          <p className="text-xs text-muted-foreground">Signals that need your attention right now.</p>
          <ul className="mt-4 space-y-4">
            {data.focusItems.map((item) => (
              <li key={item.id} className="rounded-2xl border border-border bg-muted/60 p-4 transition-colors">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{item.label}</p>
                <p className="text-base font-semibold text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </li>
            ))}
          </ul>
          {data.averageMatchScore !== null && (
            <div className="mt-4 rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Average match score</p>
              <p className="text-2xl font-semibold text-foreground">{data.averageMatchScore}%</p>
              <p className="text-muted-foreground">Top programs stay above 80%. Keep refining your profile to lift the average.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
