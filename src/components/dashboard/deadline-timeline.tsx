'use client';

import { motion } from 'framer-motion';
import { CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { stagger as listStagger, itemSlide as itemFade } from '@/lib/motion';
import { classifyDeadlineUrgency, DEADLINE_VISUAL } from '@/lib/theme/categories';

interface TimelineItem {
  id: string;
  name: string;
  date: string;
  context: string;
}

interface DeadlineTimelineProps {
  items: TimelineItem[];
}

const URGENCY_BADGE: Partial<Record<ReturnType<typeof classifyDeadlineUrgency>, string>> = {
  overdue: 'Overdue',
  'this-week': 'This week',
  'this-month': 'This month'
};

export const DeadlineTimeline = ({ items }: DeadlineTimelineProps) => {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center space-y-3">
        <CalendarClock className="h-8 w-8 mx-auto text-muted-foreground/40" />
        <p className="text-sm font-semibold text-foreground">No upcoming deadlines yet</p>
        <p className="text-xs text-muted-foreground">Track programs you plan to apply to.</p>
      </div>
    );
  }

  return (
    <motion.ol
      className="space-y-3"
      variants={listStagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
    >
      {items.map((item) => {
        const urgency = classifyDeadlineUrgency(item.date);
        const visual = DEADLINE_VISUAL[urgency];
        const Icon = visual.icon;
        const badgeLabel = URGENCY_BADGE[urgency];

        return (
          <motion.li
            key={item.id}
            className={cn(
              'group flex items-start gap-3 rounded-2xl border border-l-4 bg-card/60 p-4 shadow-sm backdrop-blur-sm transition hover:-translate-y-px hover:shadow-md',
              visual.border,
              visual.accent
            )}
            variants={itemFade}
          >
            <div className={visual.swatch}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.context}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className={cn('text-xs font-semibold uppercase tracking-wider', visual.text)}>{item.date}</p>
              {badgeLabel ? (
                <span className={cn('mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold', visual.chip)}>
                  {badgeLabel}
                </span>
              ) : null}
            </div>
          </motion.li>
        );
      })}
    </motion.ol>
  );
};
