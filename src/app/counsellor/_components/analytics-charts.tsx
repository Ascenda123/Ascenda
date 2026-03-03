import { cn } from '@/lib/utils';
import type { CohortStats } from './types';

// ─── Programme Split ──────────────────────────────────────────────────────────

interface ProgrammeSplitProps {
  breakdown: CohortStats['programmeBreakdown'];
}

export const ProgrammeSplit = ({ breakdown }: ProgrammeSplitProps) => {
  const total = breakdown.ib + breakdown.aLevel || 1;
  const ibPct = Math.round((breakdown.ib / total) * 100);
  const aLevelPct = 100 - ibPct;

  return (
    <div className="surface-card surface-card--static space-y-4">
      <p className="text-sm font-semibold text-foreground">Programme Type Split</p>
      <div className="flex h-10 overflow-hidden rounded-2xl border border-border/50">
        <div
          className="group relative flex h-full items-center justify-center bg-violet-500/70 text-xs font-bold text-white transition-all"
          style={{ width: `${ibPct}%` }}
        >
          IB {ibPct}%
          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-[11px] font-semibold text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            {breakdown.ib} students
          </span>
        </div>
        <div
          className="group relative flex h-full items-center justify-center bg-sky-500/70 text-xs font-bold text-white transition-all"
          style={{ width: `${aLevelPct}%` }}
        >
          A-Level {aLevelPct}%
          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-[11px] font-semibold text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            {breakdown.aLevel} students
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-violet-200/60 bg-violet-500/10 px-5 py-4 text-center dark:border-violet-500/20">
          <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">{breakdown.ib}</p>
          <p className="text-xs text-muted-foreground">IB students</p>
        </div>
        <div className="rounded-2xl border border-sky-200/60 bg-sky-500/10 px-5 py-4 text-center dark:border-sky-500/20">
          <p className="text-2xl font-bold text-sky-700 dark:text-sky-300">{breakdown.aLevel}</p>
          <p className="text-xs text-muted-foreground">A-Level students</p>
        </div>
      </div>
    </div>
  );
};

// ─── IB Score Distribution ────────────────────────────────────────────────────

interface IbDistributionProps {
  buckets: { label: string; count: number }[];
}

export const IbDistribution = ({ buckets }: IbDistributionProps) => {
  const max = Math.max(...buckets.map((b) => b.count), 1);
  const total = buckets.reduce((a, b) => a + b.count, 0) || 1;

  return (
    <div className="surface-card surface-card--static space-y-4">
      <p className="text-sm font-semibold text-foreground">IB Score Distribution</p>
      <div className="space-y-2.5">
        {buckets.map(({ label, count }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-right text-xs font-semibold text-muted-foreground">{label}</span>
            <div className="flex-1 overflow-hidden rounded-xl bg-muted/50">
              <div
                className="group relative flex h-7 items-center justify-end rounded-xl bg-primary/70 px-2 text-xs font-bold text-primary-foreground transition-all duration-700"
                style={{ width: `${(count / max) * 100}%`, minWidth: count > 0 ? '2rem' : '0' }}
              >
                {count > 0 ? count : ''}
                {count > 0 && (
                  <span className="pointer-events-none absolute -top-8 right-0 whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-[11px] font-semibold text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                    {count} student{count !== 1 ? 's' : ''} · {Math.round((count / total) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Field of Study Chart ─────────────────────────────────────────────────────

interface FieldChartProps {
  fields: { key: string; label: string; count: number }[];
}

const FIELD_COLORS = [
  'bg-violet-500/70',
  'bg-sky-500/70',
  'bg-emerald-500/70',
  'bg-amber-500/70',
  'bg-rose-500/70',
  'bg-indigo-500/70',
  'bg-teal-500/70',
  'bg-orange-500/70'
];

export const FieldChart = ({ fields }: FieldChartProps) => {
  const max = Math.max(...fields.map((f) => f.count), 1);
  const total = fields.reduce((a, f) => a + f.count, 0) || 1;

  return (
    <div className="surface-card surface-card--static space-y-4">
      <p className="text-sm font-semibold text-foreground">Fields of Interest</p>
      <div className="space-y-2.5">
        {fields.map(({ label, count }, idx) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-right text-xs text-muted-foreground">{label}</span>
            <div className="flex-1 overflow-hidden rounded-xl bg-muted/50">
              <div
                className={cn('group relative flex h-7 items-center justify-end rounded-xl px-2 text-xs font-bold text-white transition-all duration-700', FIELD_COLORS[idx % FIELD_COLORS.length])}
                style={{ width: `${(count / max) * 100}%`, minWidth: count > 0 ? '2rem' : '0' }}
              >
                {count > 0 ? count : ''}
                {count > 0 && (
                  <span className="pointer-events-none absolute -top-8 right-0 whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-[11px] font-semibold text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                    {count} student{count !== 1 ? 's' : ''} · {Math.round((count / total) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Application Funnel (full analytics version) ──────────────────────────────

interface FullFunnelProps {
  funnel: CohortStats['appFunnel'];
}

const FUNNEL_STAGES = [
  { key: 'planning' as const, label: 'Planning', color: 'bg-muted-foreground/40', textColor: 'text-muted-foreground' },
  { key: 'inProgress' as const, label: 'In Progress', color: 'bg-sky-500/70', textColor: 'text-sky-700 dark:text-sky-400' },
  { key: 'submitted' as const, label: 'Submitted', color: 'bg-violet-500/70', textColor: 'text-violet-700 dark:text-violet-400' },
  { key: 'decision' as const, label: 'Decision Received', color: 'bg-emerald-500/70', textColor: 'text-emerald-700 dark:text-emerald-400' }
];

export const FullFunnel = ({ funnel }: FullFunnelProps) => {
  const total = Object.values(funnel).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="surface-card surface-card--static space-y-4">
      <p className="text-sm font-semibold text-foreground">Application Funnel</p>
      <div className="space-y-3">
        {FUNNEL_STAGES.map(({ key, label, color, textColor }, idx) => {
          const count = funnel[key];
          const pct = Math.round((count / total) * 100);
          const width = Math.max(100 - idx * 12, 40);

          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className={cn('font-bold tabular-nums', textColor)}>{count} <span className="font-normal text-muted-foreground">({pct}%)</span></span>
              </div>
              <div className="flex justify-center">
                <div
                  className={cn('group relative flex h-8 items-center justify-center rounded-xl text-xs font-bold text-white transition-all', color)}
                  style={{ width: `${width}%` }}
                >
                  {count}
                  <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-[11px] font-semibold text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                    {count} application{count !== 1 ? 's' : ''} · {pct}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Match Tier Summary ───────────────────────────────────────────────────────

interface MatchTierSummaryProps {
  tiers: CohortStats['matchTiers'];
}

export const MatchTierSummary = ({ tiers }: MatchTierSummaryProps) => {
  const total = tiers.reach + tiers.match + tiers.safe || 1;

  const tierList = [
    { label: 'Reach', count: tiers.reach, color: 'bg-rose-500/80', card: 'border-rose-200/60 bg-rose-500/10 dark:border-rose-500/20', text: 'text-rose-600 dark:text-rose-400' },
    { label: 'Match', count: tiers.match, color: 'bg-amber-500/80', card: 'border-amber-200/60 bg-amber-500/10 dark:border-amber-500/20', text: 'text-amber-600 dark:text-amber-400' },
    { label: 'Safe', count: tiers.safe, color: 'bg-emerald-500/80', card: 'border-emerald-200/60 bg-emerald-500/10 dark:border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400' }
  ];

  return (
    <div className="surface-card surface-card--static space-y-4">
      <p className="text-sm font-semibold text-foreground">Match Distribution</p>

      {/* Stacked bar */}
      <div className="flex h-10 overflow-hidden rounded-2xl border border-border/50">
        {tierList.map(({ label, count, color }) => {
          const pct = (count / total) * 100;
          return pct > 0 ? (
            <div
              key={label}
              className={cn(color, 'group relative flex items-center justify-center text-xs font-bold text-white transition-all duration-700')}
              style={{ width: `${pct}%` }}
            >
              {pct > 8 ? label : ''}
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-[11px] font-semibold text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                {count} {label} · {Math.round(pct)}%
              </span>
            </div>
          ) : null;
        })}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {tierList.map(({ label, count, card, text }) => (
          <div key={label} className={cn('rounded-2xl border px-3 py-4 text-center', card)}>
            <p className={cn('text-2xl font-bold tabular-nums', text)}>{count}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-[11px] text-muted-foreground">{Math.round((count / total) * 100)}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Profile Completion Breakdown ─────────────────────────────────────────────

interface CompletionBreakdownProps {
  students: { name: string; pct: number }[];
}

export const CompletionBreakdown = ({ students }: CompletionBreakdownProps) => {
  const buckets = [
    { label: '100%', count: students.filter((s) => s.pct === 100).length, color: 'bg-emerald-500/70', tooltip: 'Fully complete' },
    { label: '75–99%', count: students.filter((s) => s.pct >= 75 && s.pct < 100).length, color: 'bg-sky-500/70', tooltip: 'Almost complete' },
    { label: '50–74%', count: students.filter((s) => s.pct >= 50 && s.pct < 75).length, color: 'bg-amber-500/70', tooltip: 'Partially complete' },
    { label: '<50%', count: students.filter((s) => s.pct < 50).length, color: 'bg-red-500/70', tooltip: 'Needs attention' }
  ];
  const max = Math.max(...buckets.map((b) => b.count), 1);
  const avg = Math.round(students.reduce((a, s) => a + s.pct, 0) / (students.length || 1));

  return (
    <div className="surface-card surface-card--static space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Profile Completion</p>
        <span className="text-sm font-bold text-primary">{avg}% avg</span>
      </div>
      <div className="space-y-2.5">
        {buckets.map(({ label, count, color, tooltip }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-14 shrink-0 text-right text-xs font-semibold text-muted-foreground">{label}</span>
            <div className="flex-1 overflow-hidden rounded-xl bg-muted/50">
              <div
                className={cn('group relative flex h-7 items-center justify-end rounded-xl px-2 text-xs font-bold text-white transition-all duration-700', color)}
                style={{ width: `${(count / max) * 100}%`, minWidth: count > 0 ? '2rem' : '0' }}
              >
                {count > 0 ? count : ''}
                {count > 0 && (
                  <span className="pointer-events-none absolute -top-8 right-0 whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-[11px] font-semibold text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                    {count} student{count !== 1 ? 's' : ''} · {tooltip}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
