import type { MatchTier } from '@/lib/matching/match-tier';

export type ProgramSearchResult = {
  id: string;
  universityName: string;
  programName: string;
  location: string;
  logoUrl?: string | null;
  fitScore?: number | null;
  tier?: MatchTier | null;
  highlights: string[];
  acceptanceRate?: number | null;
  duration?: string | null;
  durationYears?: number | null;
  tuition?: number | null;
  currency?: string | null;
  intlTuitionLow?: number | null;
  intlTuitionHigh?: number | null;
  language?: string | null;
  requiresTest?: boolean | null;
  universityId?: string;
  studyLevel?: string | null;
  campus?: string | null;
  startMonth?: string | null;
  ucasCode?: string | null;
};

export const tierFromScore = (score?: number | null): MatchTier | null => {
  if (score === null || score === undefined) return null;
  if (score >= 80) return 'Safe';
  if (score >= 45) return 'Match';
  return 'Reach';
};
