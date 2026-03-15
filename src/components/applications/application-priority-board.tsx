'use client';

import { motion } from 'framer-motion';
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
  default: 'border border-border/70 bg-background/80 text-foreground dark:border-white/10 dark:bg-muted/20',
  progress:
    'border border-sky-200/50 bg-sky-400/15 text-foreground ring-1 ring-sky-300/40 dark:border-sky-400/40 dark:bg-sky-500/10 dark:text-foreground',
  done:
    'border border-emerald-200/60 bg-emerald-500/15 text-foreground ring-1 ring-emerald-300/50 dark:border-emerald-400/50 dark:bg-emerald-500/10 dark:text-foreground'
};

const boardStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } }
};

const boardCard = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: 'easeOut' as const } }
};

export const ApplicationPriorityBoard = ({ items }: { items: PriorityItem[] }) => {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={ListPlus}
        title="No priorities yet"
        description="Add programs to see real-time priority scoring."
        className="surface-card surface-card--static min-h-[260px] rounded-[28px] border-solid text-muted-foreground"
      />
    );
  }

  return (
    <motion.div
      className="surface-card surface-card--static space-y-5 rounded-[32px] p-6"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      <motion.header className="flex flex-wrap items-center justify-between gap-3" variants={boardCard}>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Application priorities</h2>
          <p className="text-sm text-muted-foreground">Fit score + scholarship weight + deadline intensity.</p>
        </div>
        <div className="surface-chip px-4 py-1 uppercase tracking-[0.3em]">
          Live stack
        </div>
      </motion.header>
      <motion.div className="grid gap-4 md:grid-cols-2" variants={boardStagger}>
        {items.map((item) => (
          <motion.article
            key={item.id}
            className={cn(
              'group surface-subcard relative flex flex-col gap-4 overflow-hidden rounded-[28px] px-5 py-5 transition-all duration-300',
              item.priority === 'high'
                ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/15 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-20px_rgba(79,70,229,0.35)]'
                : 'hover:-translate-y-1'
            )}
            variants={boardCard}
          >
            <span className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-primary/10 via-transparent to-emerald-500/10 opacity-70" aria-hidden />
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
                className="surface-chip relative whitespace-nowrap"
              >
                <span className={`h-2 w-2 rounded-full ${PRIORITY_DOT[item.priority]}`} aria-hidden />
                {PRIORITY_LABEL[item.priority]}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm text-muted-foreground">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Fit score</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 overflow-hidden rounded-full bg-muted/80 shadow-inner">
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
                <span className="surface-chip text-[11px] uppercase tracking-[0.2em]">
                  {item.scholarshipFocus}
                </span>
              ) : null}
            </div>
          </motion.article>
        ))}
      </motion.div>
    </motion.div>
  );
};
