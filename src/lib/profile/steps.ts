export const PROFILE_STEPS = [
  {
    key: 'personal_information',
    title: 'Personal info',
    description: 'Share contact details so we can personalise guidance.'
  },
  {
    key: 'academic_input',
    title: 'Your studies',
    description: 'Outline your school details and intended subject areas.'
  },
  {
    key: 'academic_details',
    title: 'Grades & tests',
    description: 'Add subjects, grades, and test information.'
  },
  {
    key: 'activities_ambitions',
    title: 'Activities',
    description: 'Tell us about extracurriculars and what drives you.'
  },
  {
    key: 'lifestyle_preferences',
    title: 'Lifestyle',
    description: 'Tell us how you want to study and live.'
  }
] as const;

export type StepKey = (typeof PROFILE_STEPS)[number]['key'];

export type StepCompletionMap = Record<StepKey, boolean>;

export const STEP_ORDER: StepKey[] = PROFILE_STEPS.map((step) => step.key);
