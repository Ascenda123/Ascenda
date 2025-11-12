import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
  breakdown: {
    eligibility: number;
    academicFit: number;
    preferenceFit: number;
    outcomes: number;
  };
}

export const ScoreBadge = ({ score, breakdown }: ScoreBadgeProps) => {
  const tone = score >= 80 ? 'bg-emerald-100 text-emerald-900' : score >= 60 ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900';
  const title = `Eligibility ${breakdown.eligibility.toFixed(0)} • Academics ${breakdown.academicFit.toFixed(0)} • Preferences ${breakdown.preferenceFit.toFixed(0)} • Outcomes ${breakdown.outcomes.toFixed(0)}`;

  return (
    <span
      className={cn('inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold', tone)}
      role="status"
      title={title}
    >
      {score}
    </span>
  );
};
