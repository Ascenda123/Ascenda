export interface CohortStats {
  total: number;
  avgCompletion: number;
  flagged: number;
  deadlinesThisWeek: number;
  matchTiers: { reach: number; match: number; safe: number };
  appFunnel: { planning: number; inProgress: number; submitted: number; decision: number };
  programmeBreakdown: { ib: number; aLevel: number };
}
