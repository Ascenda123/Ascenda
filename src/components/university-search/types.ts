import { MatchTier } from '@/lib/matching/engine';

export type ProgramSearchResult = {
  id: string;
  universityName: string;
  programName: string;
  location: string;
  fitScore?: number | null;
  tier?: MatchTier | null;
  highlights: string[];
  acceptanceRate?: number | null;
  durationYears?: number | null;
  tuition?: number | null;
  currency?: string | null;
  intlTuitionLow?: number | null;
  intlTuitionHigh?: number | null;
  language?: string | null;
  requiresTest?: boolean | null;
};

export const tierFromScore = (score?: number | null): MatchTier | null => {
  if (score === null || score === undefined) return null;
  if (score >= 88) return 'Reach';
  if (score >= 75) return 'Match';
  return 'Safe';
};
