import { z } from 'zod';

export const CURRICULUM_OPTIONS = ['IB', 'A Levels', 'Advanced Placement', 'High School Diploma', 'Other'] as const;
export const DESTINATION_COUNTRIES = ['United Kingdom', 'Australia'] as const;
export const CAMPUS_TYPE_OPTIONS = ['urban', 'suburban', 'rural', 'online'] as const;
export const SETTING_TYPE_OPTIONS = ['public', 'private', 'international', 'other'] as const;
export const SIZE_OPTIONS = ['small', 'medium', 'large', 'mega'] as const;
export const DELIVERY_OPTIONS = ['in_person', 'online', 'hybrid'] as const;
export const PROGRAM_LEVEL_OPTIONS = [
  'Undergraduate',
  'Graduate',
  'Postgraduate',
  'Certificate',
  'Foundation',
  'Diploma'
] as const;

export const profilePersonalSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  country: z.string().min(1, 'Country is required'),
  locale: z.string().default('en'),
  timeZone: z.string().min(1, 'Time zone is required')
});

export const profileAcademicsSchema = z.object({
  curriculum: z.enum(CURRICULUM_OPTIONS, {
    errorMap: () => ({ message: 'Choose a curriculum' })
  }),
  gpa: z.number().min(0, 'GPA cannot be negative').max(4, 'GPA cannot exceed 4.0').optional(),
  ibTotal: z.number().min(0, 'Score cannot be negative').max(45, 'IB total cannot exceed 45').optional(),
  sat: z.number().min(400, 'SAT must be at least 400').max(1600, 'SAT cannot exceed 1600').optional(),
  act: z.number().min(1, 'ACT must be at least 1').max(36, 'ACT cannot exceed 36').optional(),
  toefl: z.number().min(0, 'TOEFL cannot be negative').max(120, 'TOEFL cannot exceed 120').optional(),
  ielts: z.number().min(0, 'IELTS cannot be negative').max(9, 'IELTS cannot exceed 9').optional(),
  subjectGrades: z.array(
    z.object({
      subject: z.string().min(1),
      level: z.string().min(1),
      score: z.string().min(1)
    })
  )
});

const optionalMoney = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) return undefined;
    if (typeof value === 'number' && Number.isNaN(value)) return undefined;
    if (typeof value === 'string' && value.trim() === '') return undefined;
    return value;
  },
  z.coerce.number().nonnegative().optional()
);

export const profilePreferencesSchema = z.object({
  budgetMin: optionalMoney,
  budgetMax: optionalMoney,
  aidNeeded: z.boolean().default(false),
  countries: z.array(z.enum(DESTINATION_COUNTRIES)).min(1, 'Select at least one destination'),
  campusType: z.enum(CAMPUS_TYPE_OPTIONS).optional(),
  setting: z.enum(SETTING_TYPE_OPTIONS).optional(),
  size: z.enum(SIZE_OPTIONS).optional(),
  programLevels: z.array(z.enum(PROGRAM_LEVEL_OPTIONS)).min(1, 'Choose at least one level'),
  delivery: z.enum(DELIVERY_OPTIONS).optional()
}).refine((data) => {
  if (data.budgetMin === undefined && data.budgetMax === undefined) return true;
  if (typeof data.budgetMin !== 'number' || typeof data.budgetMax !== 'number') return false;
  return data.budgetMax >= data.budgetMin && data.budgetMax > 0;
}, {
  path: ['budgetMax'],
  message: 'Enter a maximum budget that is at least the minimum and greater than zero.'
});

export const profileAspirationsSchema = z.object({
  targetFields: z.array(z.string()).min(1, 'Add at least one field'),
  jobTitles: z.array(z.string()).optional(),
  notes: z.string().optional()
});

export type ProfilePersonalValues = z.infer<typeof profilePersonalSchema>;
export type ProfileAcademicsValues = z.infer<typeof profileAcademicsSchema>;
export type ProfilePreferencesValues = z.infer<typeof profilePreferencesSchema>;
export type ProfileAspirationsValues = z.infer<typeof profileAspirationsSchema>;
