export const PROFILE_STEPS = [
  {
    key: 'personal_information',
    title: 'Personal information',
    description: 'Share contact details so we can personalise guidance.'
  },
  {
    key: 'academic_input',
    title: 'Academic input',
    description: 'Outline your school details and intended subject areas.'
  },
  {
    key: 'academic_details',
    title: 'Academic details',
    description: 'Add subjects, grades, and test information.'
  },
  {
    key: 'lifestyle_preferences',
    title: 'Lifestyle preferences',
    description: 'Tell us how you want to study and live.'
  }
] as const;

export type StepKey = (typeof PROFILE_STEPS)[number]['key'];

export type StepCompletionMap = Record<StepKey, boolean>;

export const STEP_ORDER: StepKey[] = PROFILE_STEPS.map((step) => step.key);
