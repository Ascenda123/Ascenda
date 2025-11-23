import { MatchTier } from '@/lib/matching/engine';

export type PlaceholderResult = {
  id: string;
  name: string;
  program: string;
  location: string;
  fitScore: number;
  highlights: string[];
  nextAction: string;
  due: string;
  tier: MatchTier;
};

const TIER_ORDER: MatchTier[] = ['Reach', 'Match', 'Safe'];

const tierForFitScore = (score: number): MatchTier => {
  if (score >= 88) return 'Reach';
  if (score >= 82) return 'Match';
  return 'Safe';
};

// Shared placeholder dataset for university search results and detail fallbacks.
export const placeholderResults: PlaceholderResult[] = [
  {
    id: 'harvard-computational-design',
    name: 'Harvard University',
    program: 'Computational Design',
    location: 'Cambridge, USA',
    fitScore: 92,
    highlights: ['Studio-based learning', 'Research mentorship', 'Portfolio review'],
    nextAction: 'Flag portfolio pieces for counselor review.',
    due: 'Outline by May 20',
    tier: tierForFitScore(92)
  },
  {
    id: 'stanford-engineering-society',
    name: 'Stanford University',
    program: 'Engineering & Society',
    location: 'Palo Alto, USA',
    fitScore: 88,
    highlights: ['Silicon Valley immersion', 'Entrepreneurship minor', 'Campus incubator'],
    nextAction: 'Draft note on why social impact matters to you.',
    due: 'Journal entry by May 18',
    tier: tierForFitScore(88)
  },
  {
    id: 'oxford-phil-politics',
    name: 'University of Oxford',
    program: 'Philosophy & Politics',
    location: 'Oxford, UK',
    fitScore: 85,
    highlights: ['Tutorial model', 'Collegiate community', 'Essay-focused'],
    nextAction: 'Collect writing samples for tutorial preview.',
    due: 'Samples ready by May 25',
    tier: tierForFitScore(85)
  },
  {
    id: 'eth-robotics-ai',
    name: 'ETH Zürich',
    program: 'Robotics & AI',
    location: 'Zürich, Switzerland',
    fitScore: 83,
    highlights: ['Lab rotations', 'Co-op terms', 'German immersion'],
    nextAction: 'Review language course options with counselor.',
    due: 'Plan session by May 30',
    tier: tierForFitScore(83)
  },
  {
    id: 'nus-global-business',
    name: 'National University of Singapore',
    program: 'Global Business',
    location: 'Singapore',
    fitScore: 80,
    highlights: ['Southeast Asia markets', 'Dual degree pathways', 'City campus'],
    nextAction: 'Research internships in Singapore to cite interest.',
    due: 'Talking points by June 3',
    tier: tierForFitScore(80)
  },
  {
    id: 'utoronto-data-science',
    name: 'University of Toronto',
    program: 'Data Science',
    location: 'Toronto, Canada',
    fitScore: 78,
    highlights: ['Co-op placements', 'Urban campus', 'AI research hub'],
    nextAction: 'List tech clubs to explore if admitted.',
    due: 'Club shortlist by June 8',
    tier: tierForFitScore(78)
  }
];

export { TIER_ORDER };
