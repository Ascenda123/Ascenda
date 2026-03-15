import { cn } from '@/lib/utils';
import type { CohortStats } from './types';

interface MatchDistributionProps {
  tiers: CohortStats['matchTiers'];
  activeTier?: 'reach' | 'match' | 'safe' | null;
  onSelectTier?: (tier: 'reach' | 'match' | 'safe') => void;
  onNavigateTier?: (tier: 'reach' | 'match' | 'safe') => void;
}

const TIERS = [
  { key: 'reach' as const, label: 'Reach', color: 'bg-rose-500/80', text: 'text-rose-600 dark:text-rose-400', light: 'bg-rose-500/10' },
  { key: 'match' as const, label: 'Match', color: 'bg-amber-500/80', text: 'text-amber-600 dark:text-amber-400', light: 'bg-amber-500/10' },
  { key: 'safe' as const, label: 'Safe', color: 'bg-emerald-500/80', text: 'text-emerald-600 dark:text-emerald-400', light: 'bg-emerald-500/10' }
];

export const MatchDistribution = ({ tiers, activeTier, onSelectTier, onNavigateTier }: MatchDistributionProps) => {
  const total = tiers.reach + tiers.match + tiers.safe || 1;

  return (
    <div className="space-y-4">
      {/* Stacked bar */}
      <div className="flex h-8 overflow-hidden rounded-2xl border border-border/50 transition-all">
        {TIERS.map(({ key, color }) => {
          const pct = (tiers[key] / total) * 100;
          const isSelected = activeTier === key;
          const isAnythingSelected = activeTier !== null && activeTier !== undefined;

          return pct > 0 ? (
            <div
              key={key}
              className={cn(
                color,
                "transition-all duration-700",
                onSelectTier && "cursor-pointer",
                isAnythingSelected && !isSelected && "opacity-20 grayscale-[0.8]"
              )}
              style={{ width: `${pct}%` }}
              title={`${TIERS.find(t => t.key === key)?.label}: ${tiers[key]}`}
              onClick={() => onSelectTier?.(key)}
            />
          ) : null;
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-3">
        {TIERS.map(({ key, label, text, light }) => {
          const pct = Math.round((tiers[key] / total) * 100);
          const isSelected = activeTier === key;
          const isAnythingSelected = activeTier !== null && activeTier !== undefined;

          return (
            <div
              key={key}
              className={cn(
                "rounded-2xl border transition-all",
                onSelectTier && "cursor-pointer hover:scale-[1.02]",
                isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border/50",
                light,
                isAnythingSelected && !isSelected && "opacity-40 grayscale-[0.5]"
              )}
              onClick={() => onSelectTier?.(key)}
            >
              <div className="px-4 py-3 text-center">
                <p className={`text-xl font-bold tabular-nums ${text}`}>{tiers[key]}</p>
                <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                <p className="text-[11px] text-muted-foreground">{pct}%</p>
                {onNavigateTier && tiers[key] > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onNavigateTier(key); }}
                    className="mt-1 text-[10px] text-primary hover:underline underline-offset-2 font-medium"
                  >
                    View →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">{total} total matches across cohort</p>
    </div>
  );
};
