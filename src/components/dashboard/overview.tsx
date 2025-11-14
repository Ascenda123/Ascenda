'use client';

import { useEffect, useState } from 'react';

type HighlightTone = 'positive' | 'warning' | 'muted' | undefined;

type HighlightCard = {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone?: HighlightTone;
};

type FocusItem = {
  id: string;
  label: string;
  title: string;
  detail: string;
};

type OverviewStep = {
  key: string;
  title: string;
  description: string;
  complete: boolean;
};

interface OverviewPayload {
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
    ? 'border-emerald-200 bg-emerald-50/60'
    : tone === 'warning'
      ? 'border-amber-200 bg-amber-50/60'
      : tone === 'muted'
        ? 'border-slate-100 bg-slate-50/80'
        : 'border-slate-100 bg-slate-50/40';

const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-2xl border border-slate-200 bg-slate-100/80 p-4 ${className ?? ''}`}>
    <div className="h-3 w-20 rounded-full bg-slate-200" />
    <div className="mt-4 h-10 w-24 rounded-lg bg-slate-200" />
    <div className="mt-3 h-3 w-32 rounded-full bg-slate-200" />
  </div>
);

const OverviewSkeleton = () => (
  <section
    className="space-y-6 rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)]"
    aria-hidden
  >
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="h-3 w-32 rounded-full bg-slate-200" />
      <div className="h-3 w-48 rounded-full bg-slate-200" />
    </div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((value) => (
        <SkeletonCard key={value} />
      ))}
    </div>
    <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
      <div className="h-48 animate-pulse rounded-[24px] border border-slate-100 bg-slate-50" />
      <div className="h-48 animate-pulse rounded-[24px] border border-slate-100 bg-slate-50" />
    </div>
  </section>
);

export const DashboardOverview = () => {
  const [overview, setOverview] = useState<OverviewPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/dashboard/overview', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load overview');
        }
        return response.json();
      })
      .then((data: OverviewPayload) => {
        if (isMounted) {
          setOverview(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Overview data is temporarily unavailable.');
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const totalSteps = overview?.steps.length ?? 0;

  if (error) {
    return (
      <section className="space-y-2 rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold text-slate-900">Overview temporarily offline</p>
        <p className="text-sm text-slate-500">{error}</p>
      </section>
    );
  }

  if (!overview) {
    return <OverviewSkeleton />;
  }

  return (
    <section className="space-y-6 rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Overview</p>
          <h2 className="text-2xl font-semibold text-slate-900">Readiness snapshot</h2>
        </div>
        <p className="text-sm text-slate-500">
          {overview.nextStepTitle ? `${overview.nextStepTitle} is the next best action.` : 'Everything is synced—keep momentum going.'}
        </p>
      </div>
      <div className="grid gap-4 rounded-[24px] border border-slate-100 bg-slate-50/80 p-4 sm:grid-cols-3">
        {[
          { label: 'Tasks', value: overview.todayFocus.tasks, detail: 'Due today' },
          { label: 'Deadlines', value: overview.todayFocus.deadlines, detail: 'On your radar' },
          { label: 'Interviews', value: overview.todayFocus.interviews, detail: 'Prep slots' }
        ].map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">{item.label}</p>
            <p className="text-3xl font-semibold text-slate-900">{item.value}</p>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{item.detail}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.highlightCards.map((card) => (
          <div key={card.id} className={`rounded-2xl border p-4 ${toneClass(card.tone)}`}>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{card.value}</p>
            <p className="text-sm text-slate-600">{card.detail}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
        <div className="rounded-[24px] border border-slate-100 bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Profile completion</p>
              <p className="text-3xl font-semibold text-slate-900">{overview.completionPercent}%</p>
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              {overview.completedSteps} / {totalSteps} steps
            </p>
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-100" aria-hidden>
            <div className="h-2 rounded-full bg-slate-900 transition-all" style={{ width: `${overview.completionPercent}%` }} />
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {overview.steps.map((step) => (
              <div
                key={step.key}
                className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 shadow-[0_12px_25px_rgba(15,23,42,0.04)]"
              >
                <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                <p className="text-xs text-slate-500">{step.description}</p>
                <p className={step.complete ? 'mt-3 text-sm font-semibold text-emerald-600' : 'mt-3 text-sm font-semibold text-amber-600'}>
                  {step.complete ? 'Complete' : 'Action needed'}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-slate-100 bg-white/80 p-5">
          <p className="text-sm font-semibold text-slate-900">Focus radar</p>
          <p className="text-xs text-slate-500">Signals that need your attention right now.</p>
          <ul className="mt-4 space-y-4">
            {overview.focusItems.map((item) => (
              <li key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
                <p className="text-base font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-600">{item.detail}</p>
              </li>
            ))}
          </ul>
          {overview.averageMatchScore !== null && (
            <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Average match score</p>
              <p className="text-2xl font-semibold text-slate-900">{overview.averageMatchScore}%</p>
              <p>Top programs stay above 80%. Keep refining your profile to lift the average.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
