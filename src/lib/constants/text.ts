export const ACTION_TEXT = {
  shortlist: 'Shortlist',
  shortlisted: 'Shortlisted',
  saveToPlanner: 'Add to shortlist',
  savedToPlanner: 'Shortlisted',
  addToPlanner: 'Add to planner',
  returnToDashboard: 'Return to dashboard',
  finishProfile: 'Finish profile',
  viewCourse: 'View Course',
  share: 'Share',
  adjustPreferences: 'Adjust preferences',
  updateAcademics: 'Update academics'
} as const;

export const MATCHES_TEXT = {
  hero: {
    eyebrow: 'Matches',
    title: 'Match suggestions',
    description: 'Ranked by eligibility, academic alignment, preferences, and outcome indicators.',
    highlight: 'Signals watchlist'
  },
  profileIncomplete: {
    title: 'Dial in your Fit Score',
    description: 'Complete your profile to unlock personalized program rankings, tuition filters, and signal tracking.',
    emptyMessage: 'Complete your profile to receive personalized matches.',
    highlight: 'Profile info missing'
  },
  catalogUnavailable: 'We could not load the program catalog yet. Please check back later.',
  emptyState: {
    title: 'No matches yet',
    description: 'Try widening your budget, adding more destinations, or updating test scores to unlock suggestions.'
  },
  topSnapshot: {
    eyebrow: 'Top fit snapshot',
    scoreLabel: 'Score'
  },
  list: {
    headerEyebrow: 'Matches',
    noResults: 'No matches available.'
  },
  tierDescriptions: {
    Reach: 'Highly selective universities that stretch your profile.',
    Match: 'Programs that align closely with your academic and preference fit.',
    Safe: 'Comfortable options where you exceed the entry expectations.'
  }
} as const;
