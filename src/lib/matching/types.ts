import type { MatchTier } from './engine';

export interface EnrichedMatch {
  program: {
    id: string;
    name: string;
    field?: string | null;
    level?: string | null;
    language?: string | null;
    mode?: string | null;
    tuition?: number | null;
    currency?: string | null;
    url?: string | null;
  };
  university: {
    id: string;
    name: string;
    country: string;
    rankOverall?: number | null;
    rankSource?: string | null;
    requiresTest?: boolean | null;
  };
  score: number;
  breakdown: {
    eligibility: number;
    academicFit: number;
    preferenceFit: number;
    outcomes: number;
  };
  blockingReasons: string[];
  tier: MatchTier;
}

export type MissingProfileSection = 'academic_input' | 'academic_details' | 'lifestyle_preferences';
