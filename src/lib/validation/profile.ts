import { z } from 'zod';

export const profilePersonalSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  country: z.string().min(1, 'Country is required'),
  locale: z.string().default('en'),
  timeZone: z.string().min(1, 'Time zone is required')
});

export const profileAcademicsSchema = z.object({
  curriculum: z.string().min(1, 'Curriculum is required'),
  gpa: z.number().min(0).max(4).optional(),
  ibTotal: z.number().min(0).max(45).optional(),
  sat: z.number().min(400).max(1600).optional(),
  act: z.number().min(1).max(36).optional(),
  toefl: z.number().min(0).max(120).optional(),
  ielts: z.number().min(0).max(9).optional(),
  subjectGrades: z.array(
    z.object({
      subject: z.string().min(1),
      level: z.string().min(1),
      score: z.string().min(1)
    })
  )
});

export const profilePreferencesSchema = z.object({
  budgetMin: z.number().min(0),
  budgetMax: z.number().min(0),
  aidNeeded: z.boolean().default(false),
  countries: z.array(z.string()).min(1, 'Select at least one destination'),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  campusType: z.string().optional(),
  setting: z.string().optional(),
  size: z.string().optional(),
  programLevels: z.array(z.string()).min(1, 'Choose at least one level'),
  delivery: z.string().optional()
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
