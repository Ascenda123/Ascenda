import { z } from 'zod';

export const templateTableMap = {
  universities: 'universities',
  programs: 'programs',
  requirements: 'program_requirements',
  deadlines: 'deadlines'
} as const;

export type TemplateKey = keyof typeof templateTableMap;

export const MAX_IMPORT_ROWS = 5000;

const booleanish = z.preprocess((value) => {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  return value;
}, z.boolean());

const universitiesSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  country: z.string().min(1),
  region: z.string().optional(),
  city: z.string().optional(),
  rank_overall: z.coerce.number().optional(),
  rank_source: z.string().optional(),
  website: z.string().url().optional(),
  intl_tuition_low: z.coerce.number().optional(),
  intl_tuition_high: z.coerce.number().optional(),
  currency: z.string().optional(),
  acceptance_rate: z.coerce.number().optional(),
  requires_test: booleanish.optional(),
  metadata: z.record(z.any()).optional()
});

const programsSchema = z.object({
  id: z.string().uuid().optional(),
  university_id: z.string().uuid(),
  course_name: z.string().min(1),
  study_level: z.string().optional(),
  duration: z.string().optional(),
  start_date: z.string().optional(),
  campus: z.string().optional(),
  course_summary: z.string().optional(),
  modules: z.string().optional(),
  assessment_methods: z.string().optional(),
  provider_course_url: z.string().url().optional(),
  provider_apply_url: z.string().url().optional(),
  ucas_code: z.string().optional(),
  min_alevel: z.string().optional(),
  min_ib: z.string().optional(),
  ucas_points: z.string().optional(),
  subject_requirements: z.string().optional(),
  entry_requirements_overview: z.string().optional(),
  additional_entry_requirements: z.string().optional(),
  subsequent_year_entry_requirements: z.string().optional(),
  english_requirements: z.string().optional(),
  contextual_admissions: z.string().optional(),
  tuition_fees_international: z.string().optional(),
  tuition_fees_home: z.string().optional(),
  additional_fee_info: z.string().optional(),
  student_satisfaction: z.string().optional(),
  employment_after_course: z.string().optional(),
  student_outcomes: z.string().optional(),
  average_salary_after_15m: z.string().optional(),
  historic_entry_grades: z.string().optional(),
  open_days: z.string().optional()
});

const requirementsSchema = z.object({
  program_id: z.string().uuid(),
  curriculum: z.string().optional(),
  min_gpa: z.coerce.number().optional(),
  min_ib_total: z.coerce.number().optional(),
  min_sat: z.coerce.number().optional(),
  min_act: z.coerce.number().optional(),
  required_subjects: z.array(z.string()).optional(),
  language_tests: z.record(z.string(), z.number()).optional(),
  other_requirements: z.string().optional()
});

const deadlinesSchema = z.object({
  id: z.string().uuid().optional(),
  program_id: z.string().uuid(),
  name: z.string().min(1),
  deadline_date: z.string().optional(),
  intake: z.string().optional(),
  is_rolling: booleanish.optional(),
  timezone: z.string().optional(),
  source_id: z.string().uuid().optional()
});

const templateSchemas: Record<TemplateKey, z.ZodSchema<Record<string, unknown>>> = {
  universities: universitiesSchema,
  programs: programsSchema,
  requirements: requirementsSchema,
  deadlines: deadlinesSchema
};

export const sanitizeRows = (rows: unknown[]): Record<string, unknown>[] =>
  rows
    .filter((row: any): row is Record<string, unknown> => typeof row === 'object' && row !== null)
    .map((row: Record<string, unknown>) => {
      const normalized: Record<string, unknown> = {};
      Object.entries(row).forEach(([key, value]) => {
        if (value === '' || value === undefined) return;
        if (typeof value === 'string') {
          const trimmed = value.trim();
          const first = trimmed[0];
          const last = trimmed[trimmed.length - 1];
          if (
            trimmed.length > 1 &&
            ((first === '{' && last === '}') || (first === '[' && last === ']'))
          ) {
            try {
              normalized[key] = JSON.parse(trimmed);
              return;
            } catch {
              // Fall through to saving trimmed string if JSON.parse fails.
            }
          }
          normalized[key] = trimmed;
          return;
        }
        normalized[key] = value;
      });
      return normalized;
    })
    .filter((row: Record<string, unknown>) => Object.keys(row).length > 0);

export const validateTemplateRows = (
  template: TemplateKey | undefined,
  rawRows: unknown[]
): { error?: string; rows?: Record<string, unknown>[] } => {
  if (!template || !(template in templateTableMap)) {
    return { error: 'Invalid dataset template.' };
  }

  const sanitized = sanitizeRows(rawRows);
  if (sanitized.length === 0) {
    return { error: 'No rows provided for import.' };
  }

  if (sanitized.length > MAX_IMPORT_ROWS) {
    return { error: `Row limit exceeded. Max rows: ${MAX_IMPORT_ROWS}.` };
  }

  const schema = templateSchemas[template];
  const parsedRows: Record<string, unknown>[] = [];

  for (let i = 0; i < sanitized.length; i += 1) {
    const row = sanitized[i];
    const result = schema.safeParse(row);
    if (!result.success) {
      const issue = result.error.issues[0];
      return {
        error: `Row ${i + 1} failed validation: ${issue.message}${issue.path.length ? ` at ${issue.path.join('.')}` : ''}`
      };
    }
    parsedRows.push(result.data);
  }

  return { rows: parsedRows };
};
