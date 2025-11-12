export type MatchingWeights = {
  eligibility: number;
  academicFit: number;
  preferenceFit: number;
  outcomes: number;
};

export const defaultWeights: MatchingWeights = {
  eligibility: 0.4,
  academicFit: 0.25,
  preferenceFit: 0.2,
  outcomes: 0.15
};

export const OUTCOME_RANKING_BENCHMARK = 500; // approximate global ranking percentile baseline
