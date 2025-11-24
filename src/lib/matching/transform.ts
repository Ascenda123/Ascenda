import type {
  MatchInput,
  Program,
  ProgramRequirement,
  StudentAcademics,
  StudentAspirations,
  StudentPreferences,
  University
} from './engine';

type ProgramRow = {
  id: string;
  name: string;
  field?: string | null;
  level?: string | null;
  duration_years?: number | null;
  language?: string | null;
  mode?: string | null;
  intake_months?: string[] | null;
  tuition?: number | null;
  currency?: string | null;
  url?: string | null;
  university_id: string;
};

type UniversityRow = {
  id: string;
  name: string;
  country: string;
  region?: string | null;
  rank_overall?: number | null;
  rank_source?: string | null;
  acceptance_rate?: number | null;
  requires_test?: boolean | null;
};

type RequirementRow = {
  program_id: string;
  curriculum?: string | null;
  min_gpa?: number | null;
  min_ib_total?: number | null;
  min_sat?: number | null;
  min_act?: number | null;
  required_subjects?: string[] | null;
  language_tests?: Record<string, number> | null;
  other_requirements?: string | null;
};

type AcademicsRow = {
  curriculum?: string | null;
  gpa?: number | null;
  ib_total?: number | null;
  sat?: number | null;
  act?: number | null;
  toefl?: number | null;
  ielts?: number | null;
  subject_grades?: StudentAcademics['subjectGrades'];
};

type PreferencesRow = {
  budget_min?: number | null;
  budget_max?: number | null;
  aid_needed?: boolean | null;
  countries?: string[] | null;
  languages?: string[] | null;
  campus_type?: string | null;
  setting?: string | null;
  size?: string | null;
  program_levels?: string[] | null;
  delivery?: string | null;
};

type AspirationsRow = {
  target_fields?: string[] | null;
  job_titles?: string[] | null;
};

export const mapProgramRow = (row: ProgramRow): Program => ({
  id: row.id,
  name: row.name,
  field: row.field,
  level: row.level,
  durationYears: row.duration_years,
  language: row.language,
  mode: row.mode,
  intakeMonths: row.intake_months,
  tuition: row.tuition,
  currency: row.currency,
  url: row.url,
  universityId: row.university_id
});

export const mapUniversityRow = (row: UniversityRow): University => ({
  id: row.id,
  name: row.name,
  country: row.country,
  region: row.region,
  rankOverall: row.rank_overall,
  rankSource: row.rank_source,
  acceptanceRate: row.acceptance_rate,
  requiresTest: row.requires_test
});

export const mapRequirementRow = (row: RequirementRow): ProgramRequirement => ({
  programId: row.program_id,
  curriculum: row.curriculum,
  minGpa: row.min_gpa,
  minIbTotal: row.min_ib_total,
  minSat: row.min_sat,
  minAct: row.min_act,
  requiredSubjects: row.required_subjects,
  languageTests: row.language_tests,
  otherRequirements: row.other_requirements
});

export const mapAcademicsRow = (row: AcademicsRow): StudentAcademics => ({
  curriculum: row.curriculum,
  gpa: row.gpa,
  ibTotal: row.ib_total,
  sat: row.sat,
  act: row.act,
  toefl: row.toefl,
  ielts: row.ielts,
  subjectGrades: row.subject_grades
});

export const mapPreferencesRow = (row: PreferencesRow): StudentPreferences => ({
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
});

export const mapAspirationsRow = (row: AspirationsRow): StudentAspirations => ({
  targetFields: row.target_fields,
  jobTitles: row.job_titles
});

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
