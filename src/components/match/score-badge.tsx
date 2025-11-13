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
  const tone =
    score >= 80
      ? 'from-cyan to-emerald-400'
      : score >= 60
        ? 'from-amber-300 to-sunrise'
        : 'from-rose-400 to-sunrise';
  const title = `Eligibility ${breakdown.eligibility.toFixed(0)} • Academics ${breakdown.academicFit.toFixed(
    0
  )} • Preferences ${breakdown.preferenceFit.toFixed(0)} • Outcomes ${breakdown.outcomes.toFixed(0)}`;

  return (
    <span
      className={cn(
        'inline-flex min-w-[3.5rem] items-center justify-center rounded-full bg-gradient-to-r px-4 py-1 text-sm font-semibold text-night shadow-glow-sm',
        tone
      )}
      role="status"
      title={title}
    >
      {score}
    </span>
  );
};
