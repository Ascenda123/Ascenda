import type { CohortStats } from './types';

interface CohortBreakdownProps {
  programmeBreakdown: CohortStats['programmeBreakdown'];
  fieldDistribution: { key: string; label: string; count: number }[];
}

export const CohortBreakdown = ({ programmeBreakdown, fieldDistribution }: CohortBreakdownProps) => {
  const total = programmeBreakdown.ib + programmeBreakdown.aLevel || 1;
  const ibPct = Math.round((programmeBreakdown.ib / total) * 100);
  const aLevelPct = 100 - ibPct;
  const maxField = Math.max(...fieldDistribution.map((f) => f.count), 1);

  return (
    <div className="space-y-5">
      {/* Programme type */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Programme Type</p>
        <div className="flex h-6 overflow-hidden rounded-xl border border-border/50">
          <div
            className="flex h-full items-center justify-center bg-violet-500/70 text-[11px] font-bold text-white transition-all duration-700"
            style={{ width: `${ibPct}%` }}
          >
            {ibPct > 10 ? `IB ${ibPct}%` : ''}
          </div>
          <div
            className="flex h-full items-center justify-center bg-sky-500/70 text-[11px] font-bold text-white transition-all duration-700"
            style={{ width: `${aLevelPct}%` }}
          >
            {aLevelPct > 10 ? `A-Level ${aLevelPct}%` : ''}
          </div>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-violet-500/70" />
            IB — {programmeBreakdown.ib} students
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-sky-500/70" />
            A-Level — {programmeBreakdown.aLevel} students
          </span>
        </div>
      </div>

      {/* Field distribution */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Fields of Interest</p>
        <div className="space-y-1.5">
          {fieldDistribution.slice(0, 6).map(({ label, count }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="h-5 flex-1 overflow-hidden rounded-lg bg-muted/50">
                <div
                  className="h-full rounded-lg bg-primary/60 transition-all duration-700"
                  style={{ width: `${(count / maxField) * 100}%` }}
                />
              </div>
              <div className="flex w-40 items-center justify-between">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-xs font-semibold text-foreground">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
