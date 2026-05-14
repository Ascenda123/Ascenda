import { Check, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PathwayInsight } from '@/lib/profile/pathway-status';

const TONE: Record<
  PathwayInsight['status'],
  { icon: typeof Check; pillClass: string; iconClass: string; labelClass: string }
> = {
  open: {
    icon: Check,
    pillClass: 'border-emerald-200/60 bg-emerald-500/10 dark:border-emerald-500/20',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    labelClass: 'text-emerald-700 dark:text-emerald-300'
  },
  limited: {
    icon: AlertTriangle,
    pillClass: 'border-amber-200/60 bg-amber-500/10 dark:border-amber-500/20',
    iconClass: 'text-amber-600 dark:text-amber-400',
    labelClass: 'text-amber-700 dark:text-amber-300'
  },
  closed: {
    icon: XCircle,
    pillClass: 'border-rose-200/60 bg-rose-500/10 dark:border-rose-500/20',
    iconClass: 'text-rose-600 dark:text-rose-400',
    labelClass: 'text-rose-700 dark:text-rose-300'
  }
};

export const PathwayStatusPill = ({ insight }: { insight: PathwayInsight }) => {
  const tone = TONE[insight.status];
  const Icon = tone.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl border px-4 py-3',
        tone.pillClass
      )}
    >
      <div className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center', tone.iconClass)}>
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-semibold', tone.labelClass)}>{insight.label}</p>
        <p className="text-xs text-muted-foreground">{insight.message}</p>
      </div>
    </div>
  );
};
