export type FilterKey =
  | 'countries'
  | 'subjects'
  | 'fitScore'
  | 'lifestyle'
  | 'cost'
  | 'entryRequirement'
  | 'acceptanceRate';

export interface UniversityResult {
  id: number;
  name: string;
  program: string;
  fitScore: number;
  country: string;
  subject: string;
  lifestyle: string;
  cost: 'Low' | 'Medium' | 'High';
  entryRequirement: 'Yes' | 'No';
  acceptanceRate: '0-25%' | '26-50%' | '51-75%' | '76-100%';
  scoreBucket: '0-25' | '26-50' | '51-75' | '76-100';
}

export const filterCopy: Record<FilterKey, { label: string; helper: string; single?: boolean }> = {
  countries: { label: 'Country', helper: 'Select countries you are interested in.' },
  subjects: { label: 'Subjects', helper: 'Choose subjects you want to study.' },
  fitScore: { label: 'Fit Score', helper: 'Select your desired fit score range.', single: true },
  lifestyle: { label: 'Lifestyle', helper: 'Select lifestyle preferences.' },
  cost: { label: 'Cost', helper: 'Choose cost preferences.', single: true },
  entryRequirement: { label: 'Entry Requirement Match', helper: 'Toggle if you want to match entry requirements.', single: true },
  acceptanceRate: { label: 'Acceptance Rate', helper: 'Filter by acceptance rates.', single: true }
};

export const filterOptions: Record<FilterKey, string[]> = {
  countries: ['USA', 'UK', 'Canada', 'Australia', 'Germany'],
  subjects: ['Computer Science', 'Engineering', 'Business', 'Arts', 'Biology'],
  fitScore: ['0-25', '26-50', '51-75', '76-100'],
  lifestyle: ['City', 'Campus', 'Quiet', 'Party'],
  cost: ['Low', 'Medium', 'High'],
  entryRequirement: ['Yes', 'No'],
  acceptanceRate: ['0-25%', '26-50%', '51-75%', '76-100%']
};

export const universityResults: UniversityResult[] = [
  {
    id: 1,
    name: 'Harvard University',
    program: 'Computer Science',
    country: 'USA',
    fitScore: 90,
    scoreBucket: '76-100',
    subject: 'Computer Science',
    lifestyle: 'City',
    cost: 'High',
    entryRequirement: 'Yes',
    acceptanceRate: '0-25%'
  },
  {
    id: 2,
    name: 'Stanford University',
    program: 'Engineering',
    country: 'USA',
    fitScore: 88,
    scoreBucket: '76-100',
    subject: 'Engineering',
    lifestyle: 'Campus',
    cost: 'High',
    entryRequirement: 'Yes',
    acceptanceRate: '26-50%'
  },
  {
    id: 3,
    name: 'MIT',
    program: 'Artificial Intelligence',
    country: 'USA',
    fitScore: 86,
    scoreBucket: '76-100',
    subject: 'Computer Science',
    lifestyle: 'City',
    cost: 'High',
    entryRequirement: 'Yes',
    acceptanceRate: '0-25%'
  },
  {
    id: 4,
    name: 'University of Oxford',
    program: 'Arts',
    country: 'UK',
    fitScore: 85,
    scoreBucket: '76-100',
    subject: 'Arts',
    lifestyle: 'Quiet',
    cost: 'Medium',
    entryRequirement: 'Yes',
    acceptanceRate: '26-50%'
  }
];
