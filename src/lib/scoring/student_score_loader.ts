import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';
import type { StudentProfilePayload } from '@/lib/profile/intake-types';

type Client = SupabaseClient<Database>;

const asNumber = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const buildStudentProfilePayload = async (
  supabase: Client,
  profileId: string
): Promise<StudentProfilePayload | null> => {
  const [
    personalResponse,
    academicResponse,
    subjectsResponse,
    testsResponse,
    lifestyleResponse
  ] = await Promise.all([
    supabase.from('student_personal_information').select('*').eq('profile_id', profileId).maybeSingle(),
    supabase.from('student_academic_input').select('*').eq('profile_id', profileId).maybeSingle(),
    supabase.from('student_subjects').select('*').eq('profile_id', profileId),
    supabase.from('student_admissions_tests').select('*').eq('profile_id', profileId),
    supabase.from('student_lifestyle_preference').select('*').eq('profile_id', profileId).maybeSingle()
  ]);

  if (personalResponse.error || academicResponse.error || subjectsResponse.error || testsResponse.error || lifestyleResponse.error) {
    throw new Error('Failed to load student intake records');
  }

  const personal = personalResponse.data;
  const academic = academicResponse.data;
  if (!personal || !academic) return null;

  const programmeType = academic.programme_type;
  if (!programmeType) return null;

  const subjects = (subjectsResponse.data ?? []).map((subject) => ({
    subject_name: subject.subject_name ?? '',
    level: subject.level ?? (programmeType === 'IB' ? 'HL' : 'A_LEVEL'),
    grade_value:
      programmeType === 'IB'
        ? asNumber(subject.grade_value)
        : subject.grade_value ?? null
  }));

  const admissionsTests = (testsResponse.data ?? []).map((test) => ({
    test_type: test.test_type ?? 'NONE',
    status: test.status ?? 'missing',
    score_numeric: test.score_numeric ?? null,
    percentile: test.percentile ?? null
  }));

  const payload: StudentProfilePayload = {
    personal_information: {
      first_name: personal.first_name ?? '',
      last_name: personal.last_name ?? '',
      email: personal.email ?? '',
      phone: personal.phone ?? null,
      nationality: personal.nationality ?? '',
      age: personal.age ?? null,
      gender: personal.gender ?? null,
      resident_country: personal.resident_country ?? '',
      current_location_city: personal.current_location_city ?? null,
      time_zone: personal.time_zone ?? null
    },
    academic_input: {
      programme_type: programmeType,
      school_name: academic.school_name ?? '',
      school_country: academic.school_country ?? '',
      school_city: academic.school_city ?? null,
      school_type: academic.school_type ?? null,
      language_of_instruction: academic.language_of_instruction ?? null,
      graduation_year: academic.graduation_year ?? new Date().getFullYear(),
      desired_start_date: academic.desired_start_date ?? null,
      intended_clusters: (academic.intended_clusters ?? []) as StudentProfilePayload['academic_input']['intended_clusters'],
      secondary_clusters: (academic.secondary_clusters ?? []) as StudentProfilePayload['academic_input']['secondary_clusters'],
      career_aspiration: academic.career_aspiration ?? null,
      subject_list: subjects,
      ib_total_points: academic.ib_total_points ?? null,
      ib_core_points: academic.ib_core_points ?? null,
      ib_tok_grade: academic.ib_tok_grade ?? null,
      ib_ee_grade: academic.ib_ee_grade ?? null,
      ib_math_pathway: academic.ib_math_pathway ?? null,
      ee_subject: academic.ee_subject ?? null,
      ee_title: academic.ee_title ?? null,
      ee_summary: academic.ee_summary ?? null,
      a_level_predicted_grades: (academic.a_level_predicted_grades ?? null) as StudentProfilePayload['academic_input']['a_level_predicted_grades'],
      english_required: academic.english_required ?? null,
      english_test_type: academic.english_test_type ?? 'NONE',
      english_status: academic.english_status ?? 'missing',
      english_score_overall: academic.english_score_overall ?? null,
      admissions_tests: admissionsTests
    },
    lifestyle_preference: {
      teaching_style: lifestyleResponse.data?.teaching_style ?? null,
      desired_location_type: lifestyleResponse.data?.desired_location_type ?? null,
      campus_size: lifestyleResponse.data?.campus_size ?? null,
      extracurricular_interests: lifestyleResponse.data?.extracurricular_interests ?? [],
      other_extracurriculars: lifestyleResponse.data?.other_extracurriculars ?? null,
      leadership_roles: lifestyleResponse.data?.leadership_roles ?? [],
      commitment_level: lifestyleResponse.data?.commitment_level ?? null,
      key_activities: lifestyleResponse.data?.key_activities ?? [],
      sat_score: lifestyleResponse.data?.sat_score ?? null,
      act_score: lifestyleResponse.data?.act_score ?? null,
      intl_experience: lifestyleResponse.data?.intl_experience ?? [],
      work_experience: lifestyleResponse.data?.work_experience ?? null,
      work_experience_summary: lifestyleResponse.data?.work_experience_summary ?? null,
      ambition_statement: lifestyleResponse.data?.ambition_statement ?? null
    }
  };

  return payload;
};
