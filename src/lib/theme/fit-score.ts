type FitScoreTone = 'strong' | 'solid' | 'risk' | 'unknown';

const FIT_SCORE_BUCKETS: { min: number; badge: string; text: string; tone: FitScoreTone }[] = [
  { min: 88, badge: 'text-emerald-700 ring-emerald-100 bg-emerald-50', text: 'text-emerald-700', tone: 'strong' },
  { min: 70, badge: 'text-amber-700 ring-amber-100 bg-amber-50', text: 'text-amber-700', tone: 'solid' },
  { min: 0, badge: 'text-orange-700 ring-orange-100 bg-orange-50', text: 'text-orange-700', tone: 'risk' }
];

export const normalizeFitScore = (score?: number | null) => {
  if (typeof score !== 'number' || Number.isNaN(score)) return null;
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  return clamped;
};

export const getFitScoreVisuals = (score?: number | null) => {
  const normalized = normalizeFitScore(score);
  if (normalized === null) {
    return {
      value: null,
      badgeClass: 'text-muted-foreground ring-border bg-muted',
      textClass: 'text-muted-foreground',
      tone: 'unknown' as FitScoreTone
    };
  }

  const bucket = FIT_SCORE_BUCKETS.find((entry) => normalized >= entry.min) ?? FIT_SCORE_BUCKETS[FIT_SCORE_BUCKETS.length - 1];

  return {
    value: normalized,
    badgeClass: bucket.badge,
    textClass: bucket.text,
    tone: bucket.tone
  };
};

export type FitScoreVisuals = ReturnType<typeof getFitScoreVisuals>;
