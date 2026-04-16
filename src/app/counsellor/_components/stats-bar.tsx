import { useEffect, useRef, useState } from 'react';
import { Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';
import type { CohortStats } from './types';

interface StatsBarProps {
  stats: CohortStats;
}

const STAT_CONFIG = [
  {
    key: 'total' as const,
    label: 'Total Students',
    icon: Users,
    color: 'text-violet-600',
    bg: 'bg-violet-500/10',
    border: 'border-violet-200/50 dark:border-violet-500/20'
  },
  {
    key: 'avgCompletion' as const,
    label: 'Avg Profile Complete',
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-200/50 dark:border-emerald-500/20',
    suffix: '%'
  },
  {
    key: 'deadlinesThisWeek' as const,
    label: 'Deadlines This Week',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-200/50 dark:border-amber-500/20'
  },
  {
    key: 'flagged' as const,
    label: 'Need Attention',
    icon: AlertTriangle,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-200/50 dark:border-red-500/20'
  }
];

function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest))
    });
    return () => controls.stop();
  }, [value]);

  return <>{display}</>;
}

export const StatsBar = ({ stats }: StatsBarProps) => {
  const values: Record<string, number> = {
    total: stats.total,
    avgCompletion: stats.avgCompletion,
    deadlinesThisWeek: stats.deadlinesThisWeek,
    flagged: stats.flagged
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
      {STAT_CONFIG.map(({ key, label, icon: Icon, color, bg, border, suffix }, idx) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1, duration: 0.4 }}
          className={`surface-card surface-card--static flex items-center gap-4 border ${border}`}
        >
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${bg}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
              <CountUp value={values[key]} />{suffix ?? ''}
            </p>
            <p className="truncate text-xs text-muted-foreground">{label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
