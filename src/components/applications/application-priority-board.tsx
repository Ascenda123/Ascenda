'use client';

import { motion } from 'framer-motion';
import { ListPlus } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { PRIORITY_VISUAL, PRIORITY_LABEL } from '@/lib/theme/categories';

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

const STATUS_TONE = {
  default: 'border border-border/70 bg-background/80 text-foreground dark:border-white/10 dark:bg-muted/20',
  progress:
    'border border-sky-200/50 bg-sky-400/15 text-foreground ring-1 ring-sky-300/40 dark:border-sky-400/40 dark:bg-sky-500/10',
  done:
    'border border-emerald-200/60 bg-emerald-500/15 text-foreground ring-1 ring-emerald-300/50 dark:border-emerald-400/50 dark:bg-emerald-500/10'
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
        title="Nothing to prioritise yet"
        description="Add a program and we'll show you what to tackle first."
        className="surface-card surface-card--static min-h-[260px] rounded-[28px] border-solid text-muted-foreground"
      />
    );
  }

  return (
    <motion.div
      className="surface-card surface-card--static space-y-5 rounded-[28px] p-6"
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
        {items.map((item) => {
          const visual = PRIORITY_VISUAL[item.priority];
          const Icon = visual.icon;
          return (
            <motion.article
              key={item.id}
              className={cn(
                'group surface-subcard relative flex flex-col gap-4 overflow-hidden rounded-[28px] border-l-4 px-5 py-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md',
                visual.border,
                visual.accent
              )}
              variants={boardCard}
            >
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className={visual.swatch}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs uppercase tracking-[0.3em] text-muted-foreground">{item.university}</p>
                    <h3 className="truncate text-base font-semibold text-foreground">{item.program}</h3>
                  </div>
                </div>
                <span className={cn(visual.chip, 'shrink-0 whitespace-nowrap uppercase tracking-[0.2em]')}>
                  {PRIORITY_LABEL[item.priority]}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm text-muted-foreground">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Fit score</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-muted/80 shadow-inner">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', visual.bar)}
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
                  className={cn(
                    'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] truncate',
                    /done|submitted|complete/i.test(item.status)
                      ? STATUS_TONE.done
                      : /progress|draft|essay/i.test(item.status)
                        ? STATUS_TONE.progress
                        : STATUS_TONE.default
                  )}
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
          );
        })}
      </motion.div>
    </motion.div>
  );
};
