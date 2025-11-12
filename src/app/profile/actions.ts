'use server';

import { revalidatePath } from 'next/cache';
import { createServerActionSupabaseClient } from '@/lib/supabase/server';
import {
  profilePersonalSchema,
  profileAcademicsSchema,
  profilePreferencesSchema,
  profileAspirationsSchema,
  type ProfilePersonalValues,
  type ProfileAcademicsValues,
  type ProfilePreferencesValues,
  type ProfileAspirationsValues
} from '@/lib/validation/profile';

const ensureUser = async () => {
  const supabase = createServerActionSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  return { supabase, userId: user.id };
};

export const savePersonalStep = async (values: ProfilePersonalValues) => {
  const parsed = profilePersonalSchema.parse(values);
  const { supabase, userId } = await ensureUser();

  await supabase.from('profiles').upsert({
    id: userId,
    full_name: parsed.fullName,
    country: parsed.country,
    locale: parsed.locale,
    time_zone: parsed.timeZone
  });

  revalidatePath('/profile');
  return { success: true };
};

export const saveAcademicsStep = async (values: ProfileAcademicsValues) => {
  const parsed = profileAcademicsSchema.parse(values);
  const { supabase, userId } = await ensureUser();

  await supabase.from('student_academics').upsert({
    profile_id: userId,
    curriculum: parsed.curriculum,
    gpa: parsed.gpa,
    ib_total: parsed.ibTotal,
    sat: parsed.sat,
    act: parsed.act,
    toefl: parsed.toefl,
    ielts: parsed.ielts,
    subject_grades: parsed.subjectGrades
  });

  revalidatePath('/profile');
  return { success: true };
};

export const savePreferencesStep = async (values: ProfilePreferencesValues) => {
  const parsed = profilePreferencesSchema.parse(values);
  const { supabase, userId } = await ensureUser();

  await supabase.from('student_preferences').upsert({
    profile_id: userId,
    budget_min: parsed.budgetMin,
    budget_max: parsed.budgetMax,
    aid_needed: parsed.aidNeeded,
    countries: parsed.countries,
    languages: parsed.languages,
    campus_type: parsed.campusType,
    setting: parsed.setting,
    size: parsed.size,
    program_levels: parsed.programLevels,
    delivery: parsed.delivery
  });

  revalidatePath('/profile');
  return { success: true };
};

export const saveAspirationsStep = async (values: ProfileAspirationsValues) => {
  const parsed = profileAspirationsSchema.parse(values);
  const { supabase, userId } = await ensureUser();

  await supabase.from('student_aspirations').upsert({
    profile_id: userId,
    target_fields: parsed.targetFields,
    job_titles: parsed.jobTitles,
    notes: parsed.notes
  });

  revalidatePath('/profile');
  return { success: true };
};
