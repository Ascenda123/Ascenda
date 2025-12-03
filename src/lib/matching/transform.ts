import { z } from 'zod';
import type {
  MatchInput,
  Program,
  ProgramRequirement,
  StudentAcademics,
  StudentAspirations,
  StudentPreferences,
  University
} from './engine';

const ProgramRowSchema = z.object({
  id: z.string(),
  course_name: z.string(),
  study_level: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(),
  campus: z.string().nullable().optional(),
  tuition_fees_international: z.string().nullable().optional(),
  tuition_fees_home: z.string().nullable().optional(),
  provider_course_url: z.string().nullable().optional(),
  university_id: z.string()
});

const UniversityRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
  region: z.string().nullable().optional(),
  rank_overall: z.number().nullable().optional(),
  rank_source: z.string().nullable().optional(),
  acceptance_rate: z.coerce.number().nullable().optional(),
  requires_test: z.boolean().nullable().optional()
});

const RequirementRowSchema = z.object({
  program_id: z.string(),
  curriculum: z.string().nullable().optional(),
  min_gpa: z.coerce.number().nullable().optional(),
  min_ib_total: z.coerce.number().nullable().optional(),
  min_sat: z.coerce.number().nullable().optional(),
  min_act: z.coerce.number().nullable().optional(),
  required_subjects: z.array(z.string()).nullable().optional(),
  language_tests: z.record(z.string(), z.number()).nullable().optional(),
  other_requirements: z.string().nullable().optional()
});

const AcademicsRowSchema = z.object({
  curriculum: z.string().nullable().optional(),
  gpa: z.coerce.number().nullable().optional(),
  ib_total: z.coerce.number().nullable().optional(),
  sat: z.coerce.number().nullable().optional(),
  act: z.coerce.number().nullable().optional(),
  toefl: z.coerce.number().nullable().optional(),
  ielts: z.coerce.number().nullable().optional(),
  subject_grades: z.array(z.object({
    subject: z.string(),
    level: z.string(),
    score: z.string()
  })).nullable().optional()
});

const PreferencesRowSchema = z.object({
  budget_min: z.coerce.number().nullable().optional(),
  budget_max: z.coerce.number().nullable().optional(),
  aid_needed: z.boolean().nullable().optional(),
  countries: z.array(z.string()).nullable().optional(),
  languages: z.array(z.string()).nullable().optional(),
  campus_type: z.string().nullable().optional(),
  setting: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  program_levels: z.array(z.string()).nullable().optional(),
  delivery: z.string().nullable().optional()
});

const AspirationsRowSchema = z.object({
  target_fields: z.array(z.string()).nullable().optional(),
  job_titles: z.array(z.string()).nullable().optional()
});

export const mapProgramRow = (input: unknown): Program => {
  const row = ProgramRowSchema.parse(input);
  return {
    id: row.id,
    name: row.course_name,
    field: null,
    level: row.study_level,
    durationYears: null,
    language: null,
    mode: null,
    intakeMonths: row.start_date ? [row.start_date] : null,
    tuition: null,
    currency: null,
    url: row.provider_course_url,
    universityId: row.university_id
  };
};

export const mapUniversityRow = (input: unknown): University => {
  const row = UniversityRowSchema.parse(input);
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    region: row.region,
    rankOverall: row.rank_overall,
    rankSource: row.rank_source,
    acceptanceRate: row.acceptance_rate,
    requiresTest: row.requires_test
  };
};

export const mapRequirementRow = (input: unknown): ProgramRequirement => {
  const row = RequirementRowSchema.parse(input);
  return {
    programId: row.program_id,
    curriculum: row.curriculum,
    minGpa: row.min_gpa,
    minIbTotal: row.min_ib_total,
    minSat: row.min_sat,
    minAct: row.min_act,
    requiredSubjects: row.required_subjects,
    languageTests: row.language_tests,
    otherRequirements: row.other_requirements
  };
};

export const mapAcademicsRow = (input: unknown): StudentAcademics => {
  const row = AcademicsRowSchema.parse(input);
  return {
    curriculum: row.curriculum,
    gpa: row.gpa,
    ibTotal: row.ib_total,
    sat: row.sat,
    act: row.act,
    toefl: row.toefl,
    ielts: row.ielts,
    subjectGrades: row.subject_grades
  };
};

export const mapPreferencesRow = (input: unknown): StudentPreferences => {
  const row = PreferencesRowSchema.parse(input);
  return {
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    aidNeeded: row.aid_needed,
    countries: row.countries,
    languages: row.languages,
    campusType: row.campus_type,
    setting: row.setting,
    size: row.size,
    programLevels: row.program_levels,
    delivery: row.delivery
  };
};

export const mapAspirationsRow = (input: unknown): StudentAspirations => {
  const row = AspirationsRowSchema.parse(input);
  return {
    targetFields: row.target_fields,
    jobTitles: row.job_titles
  };
};

export const buildMatchInput = (params: {
  program: Program;
  university?: University | null;
  requirement?: ProgramRequirement | null;
  academics: StudentAcademics;
  preferences: StudentPreferences;
  aspirations: StudentAspirations;
}): MatchInput | null => {
  if (!params.university) return null;

  return {
    program: params.program,
    university: params.university,
    requirement: params.requirement ?? undefined,
    academics: params.academics,
    preferences: params.preferences,
    aspirations: params.aspirations
  };
};
