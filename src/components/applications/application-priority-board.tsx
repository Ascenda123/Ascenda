'use client';

import { ListPlus } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

export interface PriorityItem {
  id: string;
  program: string;
  university: string;
  priority: 'high' | 'medium' | 'watch';
  fitScore?: number | null;
  status: string;
  nextDeadline?: string;
  tasksRemaining: number;
  scholarshipFocus?: string;
}

const PRIORITY_LABEL: Record<PriorityItem['priority'], string> = {
  high: 'Prime focus',
  medium: 'Advancing',
  watch: 'Actively watching'
};

const PRIORITY_DOT: Record<PriorityItem['priority'], string> = {
  high: 'bg-rose-500',
  medium: 'bg-amber-500',
  watch: 'bg-emerald-500'
};

const STATUS_TONE = {
  default: 'border border-white/10 bg-white/5 text-foreground backdrop-blur-sm dark:border-white/10',
  progress:
    'border border-sky-200/50 bg-sky-400/15 text-foreground ring-1 ring-sky-300/40 backdrop-blur-sm dark:border-sky-400/40 dark:bg-sky-500/10 dark:text-foreground',
  done:
    'border border-emerald-200/60 bg-emerald-500/15 text-foreground ring-1 ring-emerald-300/50 backdrop-blur-sm dark:border-emerald-400/50 dark:bg-emerald-500/10 dark:text-foreground'
};

export const ApplicationPriorityBoard = ({ items }: { items: PriorityItem[] }) => {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={ListPlus}
        title="No priorities yet"
        description="Add programs to see real-time priority scoring."
        className="rounded-[28px] border border-solid border-white/20 bg-card/60 text-muted-foreground shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-lg dark:border-white/10"
      />
    );
  }

  return (
    <div className="space-y-5 rounded-[32px] border border-white/15 bg-card/60 p-6 shadow-[0_26px_90px_rgba(15,23,42,0.22)] backdrop-blur-xl transition-colors dark:border-white/10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Application priorities</h2>
          <p className="text-sm text-muted-foreground">Fit score + scholarship weight + deadline intensity.</p>
        </div>
        <div className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-foreground shadow-[0_6px_20px_rgba(15,23,42,0.12)] backdrop-blur-sm">
          Live stack
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.id}
            className={cn(
              'group relative flex flex-col gap-4 overflow-hidden rounded-[28px] border px-5 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.22)] backdrop-blur-lg transition-all duration-300',
              item.priority === 'high'
                ? 'border-primary/40 bg-white/10 ring-1 ring-primary/25 hover:-translate-y-1.5 hover:shadow-[0_32px_80px_rgba(15,23,42,0.3)]'
                : 'border-white/12 bg-white/5 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,23,42,0.26)] dark:border-white/10'
            )}
          >
            <span className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/5 via-primary/5 to-emerald-500/5 opacity-60" aria-hidden />
            {item.priority === 'high' ? (
              <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]" aria-hidden>
                <span className="absolute inset-y-0 -left-1/3 w-1/2 bg-gradient-to-r from-transparent via-primary/25 to-transparent opacity-80 blur-[1px] animate-shimmer" />
              </span>
            ) : null}
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs uppercase tracking-[0.3em] text-muted-foreground">{item.university}</p>
                <h3 className="truncate text-base font-semibold text-foreground">{item.program}</h3>
              </div>
              <span
                className="relative inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-foreground shadow-[0_4px_16px_rgba(15,23,42,0.12)] backdrop-blur-sm ring-1 ring-white/15"
              >
                <span className={`h-2 w-2 rounded-full ${PRIORITY_DOT[item.priority]}`} aria-hidden />
                {PRIORITY_LABEL[item.priority]}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm text-muted-foreground">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Fit score</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 overflow-hidden rounded-full bg-white/10 shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary via-sky-400 to-emerald-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, item.fitScore ?? 0))}%` }}
                    />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {typeof item.fitScore === 'number' ? `${Math.round(item.fitScore)}%` : 'N/A'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Next deadline</p>
                <p className="text-xs">{item.nextDeadline ?? 'TBD'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Tasks</p>
                <p className="text-xs">{item.tasksRemaining} open</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] truncate ${
                  /done|submitted|complete/i.test(item.status)
                    ? STATUS_TONE.done
                    : /progress|draft|essay/i.test(item.status)
                      ? STATUS_TONE.progress
                      : STATUS_TONE.default
                }`}
              >
                {item.status}
              </span>
              {item.scholarshipFocus ? (
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground backdrop-blur-sm">
                  {item.scholarshipFocus}
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
