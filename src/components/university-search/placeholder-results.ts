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
  acceptanceRate: number;
  durationYears: number;
  placementYear: boolean;
  studyAbroad: boolean;
  domesticTuition: string;
  internationalTuition: string;
  applicationStatus: 'Not started' | 'In progress' | 'Submitted';
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
    tier: tierForFitScore(92),
    acceptanceRate: 8,
    durationYears: 4,
    placementYear: true,
    studyAbroad: true,
    domesticTuition: '$58,000',
    internationalTuition: '$58,000',
    applicationStatus: 'In progress'
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
    tier: tierForFitScore(88),
    acceptanceRate: 9,
    durationYears: 4,
    placementYear: true,
    studyAbroad: true,
    domesticTuition: '$56,000',
    internationalTuition: '$56,000',
    applicationStatus: 'In progress'
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
    tier: tierForFitScore(85),
    acceptanceRate: 15,
    durationYears: 3,
    placementYear: false,
    studyAbroad: false,
    domesticTuition: '£9,250',
    internationalTuition: '£37,200',
    applicationStatus: 'Not started'
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
    tier: tierForFitScore(83),
    acceptanceRate: 27,
    durationYears: 3,
    placementYear: true,
    studyAbroad: true,
    domesticTuition: 'CHF 1,500',
    internationalTuition: 'CHF 1,500',
    applicationStatus: 'Not started'
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
    tier: tierForFitScore(80),
    acceptanceRate: 18,
    durationYears: 4,
    placementYear: true,
    studyAbroad: true,
    domesticTuition: 'S$8,250',
    internationalTuition: 'S$31,100',
    applicationStatus: 'In progress'
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
    tier: tierForFitScore(78),
    acceptanceRate: 43,
    durationYears: 4,
    placementYear: true,
    studyAbroad: true,
    domesticTuition: 'CA$6,590',
    internationalTuition: 'CA$58,680',
    applicationStatus: 'Submitted'
  }
];

export { TIER_ORDER };
