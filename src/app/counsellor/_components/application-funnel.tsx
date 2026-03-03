import { cn } from '@/lib/utils';
import type { CohortStats } from './types';

interface ApplicationFunnelProps {
  funnel: CohortStats['appFunnel'];
  activeStage?: 'planning' | 'inProgress' | 'submitted' | 'decision' | null;
  onSelectStage?: (stage: 'planning' | 'inProgress' | 'submitted' | 'decision') => void;
}

const STAGES = [
  { key: 'planning' as const, label: 'Planning', color: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', active: 'ring-2 ring-primary ring-offset-2' },
  { key: 'inProgress' as const, label: 'In Progress', color: 'bg-sky-500/20', text: 'text-sky-700 dark:text-sky-400', border: 'border-sky-200/60 dark:border-sky-500/30', active: 'ring-2 ring-sky-500 ring-offset-2' },
  { key: 'submitted' as const, label: 'Submitted', color: 'bg-violet-500/15', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-200/60 dark:border-violet-500/30', active: 'ring-2 ring-violet-500 ring-offset-2' },
  { key: 'decision' as const, label: 'Decision', color: 'bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200/60 dark:border-emerald-500/30', active: 'ring-2 ring-emerald-500 ring-offset-2' }
];

export const ApplicationFunnel = ({ funnel, activeStage, onSelectStage }: ApplicationFunnelProps) => {
  const total = Object.values(funnel).reduce((a, b) => a + b, 0) || 1;
  const maxVal = Math.max(...Object.values(funnel), 1);

  return (
    <div className="space-y-3">
      {STAGES.map(({ key, label, color, text, border, active }) => {
        const count = funnel[key];
        const pct = Math.round((count / total) * 100);
        const barWidth = Math.round((count / maxVal) * 100);
        const isSelected = activeStage === key;

        return (
          <div
            key={key}
            className={cn(
              "space-y-1 transition-all",
              onSelectStage && "cursor-pointer hover:opacity-80",
              isSelected ? "scale-[1.02]" : "opacity-60 grayscale-[0.5]"
            )}
            onClick={() => onSelectStage?.(key)}
          >
            <div className="flex items-center justify-between text-xs">
              <span className={cn("font-medium", isSelected ? "text-foreground font-bold" : "text-muted-foreground")}>{label}</span>
              <span className={`font-bold ${text}`}>{count} <span className="font-normal text-muted-foreground">({pct}%)</span></span>
            </div>
            <div className={cn(
              "h-7 overflow-hidden rounded-xl border border-border/50 bg-muted/40 transition-all",
              isSelected && active
            )}>
              <div
                className={`flex h-full items-center rounded-xl border px-3 text-xs font-semibold transition-all duration-700 ${color} ${border} ${text}`}
                style={{ width: `${Math.max(barWidth, count > 0 ? 8 : 0)}%` }}
              >
                {count > 0 && count}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
