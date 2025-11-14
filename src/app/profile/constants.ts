export const PROFILE_STEPS = [
  {
    key: 'personal',
    title: 'Personal details',
    description: 'Tell us about yourself so we can personalize guidance.'
  },
  {
    key: 'academics',
    title: 'Academic profile',
    description: 'Share grades and test scores to assess eligibility.'
  },
  {
    key: 'preferences',
    title: 'Preferences',
    description: 'Where do you want to study and under what conditions?'
  },
  {
    key: 'aspirations',
    title: 'Aspirations',
    description: 'Help us understand your goals and target outcomes.'
  }
] as const;

export type StepKey = (typeof PROFILE_STEPS)[number]['key'];

export type StepCompletionMap = Record<StepKey, boolean>;

export const STEP_ORDER: StepKey[] = PROFILE_STEPS.map((step) => step.key);
