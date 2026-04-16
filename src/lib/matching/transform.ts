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
import type { Database } from '../types/database';

type ProgramRowInput = Database['public']['Tables']['programs']['Row'] & {
  name?: string | null;
  level?: string | null;
  duration_years?: number | null;
  intake_months?: string[] | null;
  tuition?: number | null;
  currency?: string | null;
  url?: string | null;
  metadata?: Record<string, unknown> | null;
};

type UniversityRowInput = Database['public']['Tables']['universities']['Row'];
type RequirementRowInput = Database['public']['Tables']['program_requirements']['Row'];
type AcademicInputRow = Database['public']['Tables']['student_academic_input']['Row'];
type LifestyleRow = Database['public']['Tables']['student_lifestyle_preference']['Row'];
type SubjectRow = Database['public']['Tables']['student_subjects']['Row'];

const ProgramRowSchema = z.object({
  id: z.string(),
  // Legacy and current naming support
  course_name: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  study_level: z.string().nullable().optional(),
  level: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  duration_years: z.coerce.number().nullable().optional(),
  start_date: z.string().nullable().optional(),
  intake_months: z.array(z.string()).nullable().optional(),
  campus: z.string().nullable().optional(),
  tuition_fees_international: z.coerce.number().nullable().optional(),
  tuition_fees_home: z.coerce.number().nullable().optional(),
  tuition: z.coerce.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  provider_course_url: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  university_id: z.string(),
  metadata: z.record(z.unknown()).nullable().optional()
});

const UniversityRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
  region: z.string().nullable().optional(),
  rank_overall: z.number().nullable().optional(),
  rank_source: z.string().nullable().optional(),
  acceptance_rate: z.coerce.number().nullable().optional(),
  requires_test: z.boolean().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional()
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

const AcademicInputSchema = z.object({
  programme_type: z.string().nullable().optional(),
  ib_total_points: z.coerce.number().nullable().optional(),
  english_test_type: z.string().nullable().optional(),
  english_score_overall: z.coerce.number().nullable().optional(),
  intended_clusters: z.array(z.string()).nullable().optional()
});

const LifestyleSchema = z.object({
  desired_location_type: z.string().nullable().optional(),
  campus_size: z.string().nullable().optional()
});

const SubjectSchema = z.object({
  subject_name: z.string().nullable().optional(),
  level: z.string().nullable().optional(),
  grade_value: z.string().nullable().optional()
});

const CLUSTER_LABELS: Record<string, string> = {
  computer_science: 'Computer Science',
  maths: 'Mathematics',
  engineering: 'Engineering',
  life_sciences_biochem: 'Life Sciences',
  medicine_dentistry: 'Medicine',
  economics_quant: 'Economics',
  business_non_quant: 'Business',
  law: 'Law',
  humanities: 'Humanities',
  creative: 'Creative Arts'
};

export const mapProgramRow = (input: ProgramRowInput): Program => {
  const row = ProgramRowSchema.parse(input);
  const programName = row.course_name ?? row.name ?? 'Program';
  const level = row.study_level ?? row.level ?? null;
  const tuition = row.tuition ?? row.tuition_fees_international ?? null;
  const currency = row.currency ?? null;
  const intakeMonths = row.intake_months ?? (row.start_date ? [row.start_date] : null);
  const durationYears = row.duration_years ?? null;

  return {
    id: row.id,
    name: programName,
    field: null,
    level,
    durationYears,
    language: null,
    mode: null,
    intakeMonths,
    tuition,
    currency,
    url: row.provider_course_url ?? row.url ?? null,
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

export const mapAcademicsRow = (input: AcademicInputRow, subjects: SubjectRow[] = []): StudentAcademics => {
  const row = AcademicInputSchema.parse(input);
  const subjectRows = subjects
    .map((subject) => SubjectSchema.parse(subject))
    .filter((subject) => Boolean(subject.subject_name));
  const englishScore = row.english_score_overall ?? null;
  const englishType = row.english_test_type?.toUpperCase() ?? null;

  return {
    curriculum: row.programme_type ?? null,
    ibTotal: row.ib_total_points ?? null,
    toefl: englishType === 'TOEFL' ? englishScore : null,
    ielts: englishType === 'IELTS' ? englishScore : null,
    subjectGrades: subjectRows.length
      ? subjectRows.map((subject) => ({
        subject: subject.subject_name ?? '',
        level: subject.level ?? '',
        score: subject.grade_value ?? ''
      }))
      : null
  };
};

export const mapPreferencesRow = (input: LifestyleRow | null): StudentPreferences => {
  if (!input) {
    return {};
  }
  const row = LifestyleSchema.parse(input);
  return {
    campusType: row.desired_location_type ?? null,
    size: row.campus_size ?? null
  };
};

export const mapAspirationsRow = (input: AcademicInputRow | null): StudentAspirations => {
  if (!input) return {};
  const row = AcademicInputSchema.parse(input);
  const targets = (row.intended_clusters ?? []).map((cluster) => CLUSTER_LABELS[cluster] ?? cluster);
  return {
    targetFields: targets
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
