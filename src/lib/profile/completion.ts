import { type StepCompletionMap } from './steps';

type ProfileRow = { full_name?: string | null; country?: string | null; time_zone?: string | null } | null;
type AcademicsRow = { curriculum?: string | null } | null;
type PreferencesRow = { countries?: string[] | null } | null;
type AspirationsRow = { target_fields?: string[] | null } | null;

export interface ProfileRecordGroup {
  profile: ProfileRow;
  academics: AcademicsRow;
  preferences: PreferencesRow;
  aspirations: AspirationsRow;
}

export const buildStepCompletion = ({
  profile,
  academics,
  preferences,
  aspirations
}: ProfileRecordGroup): StepCompletionMap => ({
  personal: Boolean(profile?.full_name && profile?.country && profile?.time_zone),
  academics: Boolean(academics?.curriculum),
  preferences: Boolean((preferences?.countries ?? []).length),
  aspirations: Boolean((aspirations?.target_fields ?? []).length)
});

export const isProfileComplete = (records: ProfileRecordGroup): boolean => {
  const completion = buildStepCompletion(records);
  return Object.values(completion).every(Boolean);
};
