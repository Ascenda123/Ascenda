'use client';

import { motion } from 'framer-motion';
import { CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { stagger as listStagger, itemSlide as itemFade } from '@/lib/motion';

interface TimelineItem {
  id: string;
  name: string;
  date: string;
  context: string;
}

interface DeadlineTimelineProps {
  items: TimelineItem[];
}

function urgencyLevel(dateStr: string): 'critical' | 'warning' | 'normal' {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return 'normal';
  const diff = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 3) return 'critical';
  if (diff <= 7) return 'warning';
  return 'normal';
}

const URGENCY_STYLES = {
  critical: {
    dot: 'bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]',
    border: 'border-l-rose-500',
    label: 'text-rose-600',
  },
  warning: {
    dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]',
    border: 'border-l-amber-500',
    label: 'text-amber-600',
  },
  normal: {
    dot: 'bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]',
    border: 'border-l-primary/30',
    label: 'text-muted-foreground',
  },
};

export const DeadlineTimeline = ({ items }: DeadlineTimelineProps) => {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center space-y-3">
        <CalendarClock className="h-8 w-8 mx-auto text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No upcoming deadlines yet.</p>
        <p className="text-xs text-muted-foreground/60">Track programs you plan to apply to.</p>
      </div>
    );
  }

  return (
    <motion.ol
      className="relative space-y-3 pl-4 border-l-2 border-border/50"
      variants={listStagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
    >
      {items.map((item) => {
        const urgency = urgencyLevel(item.date);
        const styles = URGENCY_STYLES[urgency];

        return (
          <motion.li
            key={item.id}
            className={cn(
              'group relative ml-4 rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-card/90 hover:shadow-md hover:-translate-y-px border-l-[3px]',
              styles.border
            )}
            variants={itemFade}
          >
            {/* Timeline dot */}
            <div className={cn('absolute -left-[calc(1rem+11px)] top-5 h-3 w-3 rounded-full border-2 border-background', styles.dot)} />

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{item.context}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className={cn('text-xs font-semibold uppercase tracking-wider', styles.label)}>
                  {item.date}
                </p>
                {urgency === 'critical' && (
                  <motion.span
                    className="inline-block mt-0.5 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-600"
                    animate={{ opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Urgent
                  </motion.span>
                )}
                {urgency === 'warning' && (
                  <span className="inline-block mt-0.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                    Soon
                  </span>
                )}
              </div>
            </div>
          </motion.li>
        );
      })}
    </motion.ol>
  );
};
