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
      ? 'bg-emerald-100 text-emerald-800'
      : score >= 60
        ? 'bg-amber-100 text-amber-800'
        : 'bg-rose-100 text-rose-800';
  const title = `Eligibility ${breakdown.eligibility.toFixed(0)} • Academics ${breakdown.academicFit.toFixed(
    0
  )} • Preferences ${breakdown.preferenceFit.toFixed(0)} • Outcomes ${breakdown.outcomes.toFixed(0)}`;

  return (
    <span
      className={cn(
        'inline-flex min-w-[3.5rem] items-center justify-center rounded-full px-4 py-1 text-sm font-semibold shadow-[0_10px_25px_rgba(15,23,42,0.1)]',
        tone
      )}
      role="status"
      title={title}
    >
      {score}
    </span>
  );
};
