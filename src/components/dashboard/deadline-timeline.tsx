'use client';

import { motion } from 'framer-motion';

interface TimelineItem {
  id: string;
  name: string;
  date: string;
  context: string;
}

interface DeadlineTimelineProps {
  items: TimelineItem[];
}

const listStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
};

const itemFade = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' as const } }
};

export const DeadlineTimeline = ({ items }: DeadlineTimelineProps) => {
  if (items.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        No upcoming deadlines yet. Track programs you plan to apply to.
      </div>
    );
  }

  return (
    <motion.ol
      className="space-y-4"
      variants={listStagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
    >
      {items.map((item) => (
        <motion.li
          key={item.id}
          className="group flex gap-3 rounded-2xl border border-border bg-card/50 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-sm transition-all duration-300 hover:bg-card/80 hover:shadow-[0_15px_40px_rgba(15,23,42,0.1)]"
          variants={itemFade}
        >
          <div className="mt-1 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-foreground">{item.name}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{item.date}</p>
            <p className="text-sm text-muted-foreground">{item.context}</p>
          </div>
        </motion.li>
      ))}
    </motion.ol>
  );
};
