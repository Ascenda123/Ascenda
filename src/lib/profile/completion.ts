import { type StepCompletionMap } from './steps';

type PersonalRow = {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  nationality?: string | null;
  resident_country?: string | null;
} | null;
type AcademicInputRow = {
  programme_type?: string | null;
  school_name?: string | null;
  school_country?: string | null;
  graduation_year?: number | null;
  intended_clusters?: string[] | null;
  english_required?: boolean | null;
} | null;
type LifestyleRow = { extracurricular_interests?: string[] | null } | null;

export interface ProfileRecordGroup {
  personal: PersonalRow;
  academicInput: AcademicInputRow;
  subjectCount: number;
  lifestyle: LifestyleRow;
}

export const buildStepCompletion = ({
  personal,
  academicInput,
  subjectCount,
  lifestyle
}: ProfileRecordGroup): StepCompletionMap => ({
  personal_information: Boolean(
    personal?.first_name && personal?.last_name && personal?.email && personal?.nationality && personal?.resident_country
  ),
  academic_input: Boolean(
    academicInput?.programme_type &&
      academicInput?.school_name &&
      academicInput?.school_country &&
      academicInput?.graduation_year &&
      (academicInput?.intended_clusters ?? []).length > 0
  ),
  academic_details: Boolean(subjectCount > 0 && academicInput?.english_required !== null && academicInput?.english_required !== undefined),
  lifestyle_preferences: Boolean(lifestyle)
});

export const isProfileComplete = (records: ProfileRecordGroup): boolean => {
  const completion = buildStepCompletion(records);
  return Object.values(completion).every(Boolean);
};
