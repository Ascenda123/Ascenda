import type { SupabaseClient } from '@supabase/supabase-js';
import type { MatchingWeights } from './config';
import { filterVisiblePrograms, getFlaggedProgramIds } from '../catalog/visibility';
import type { Database } from '../types/database';
import type { EnrichedMatch, MissingProfileSection } from './types';
import type { MatchTier } from './match-tier';
import type { StudentProfilePayload } from '@/lib/profile/intake-types';
import { scoreStudentProfile } from '@/lib/scoring/student_scoring';
import type { CourseRecord, EnrichedCourseRecord } from '@/lib/tiering/course_tiering';
import { rankCourseMatches } from '@/lib/matching/matching_engine';

type StudentAcademicInputRow = Database['public']['Tables']['student_academic_input']['Row'];
type StudentLifestyleRow = Database['public']['Tables']['student_lifestyle_preference']['Row'];
type StudentSubjectRow = Database['public']['Tables']['student_subjects']['Row'];
type StudentAdmissionsTestRow = Database['public']['Tables']['student_admissions_tests']['Row'];
type ProgramRow = Database['public']['Tables']['programs']['Row'];
type CourseScoringRow = Database['public']['Views']['course_scoring_v1']['Row'];
type ProgramSummaryRow = Pick<ProgramRow, 'id' | 'metadata'>;

type Client = SupabaseClient<Database>;

type LoadMatchesOptions = {
  programLimit?: number;
  resultLimit?: number;
  weights?: MatchingWeights;
};

export type MatchComputationResult = {
  matches: EnrichedMatch[];
  catalogSize: { programs: number; universities: number };
  missingSections: MissingProfileSection[];
  error?: { stage: 'profile' | 'programs' | 'universities' | 'requirements'; message: string };
};

const PROGRAM_PAGE_SIZE = 200;

const applyProgramVisibilityFilters = (query: ReturnType<Client['from']>) => {
  const flagged = getFlaggedProgramIds();
  if (!flagged.length) return query.order('id', { ascending: true });

  const formatted = flagged.map((id) => `"${id}"`).join(',');
  return query.not('id', 'in', `(${formatted})`).order('id', { ascending: true });
};

const asNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const asString = (value: unknown): string | null => (typeof value === 'string' && value.trim() ? value.trim() : null);

const asCostOfLife = (value: unknown): CourseRecord['cost_of_life'] => {
  if (!value) return null;
  const normalized = String(value).toUpperCase();
  if (normalized === 'HIGH' || normalized === 'MEDIUM' || normalized === 'LOW') return normalized;
  return null;
};

type CourseSource = EnrichedCourseRecord & {
  program_id: string;
  university_id: string;
  program_level: string | null;
  program_language: string | null;
  program_mode: string | null;
  program_tuition: number | null;
  program_currency: string | null;
  program_url: string | null;
  university_country: string;
  university_rank_overall: number | null;
  university_rank_source: string | null;
  university_requires_test: boolean | null;
};

const buildStudentPayload = (params: {
  academic: StudentAcademicInputRow;
  lifestyle: StudentLifestyleRow | null;
  subjects: StudentSubjectRow[];
  admissionsTests: StudentAdmissionsTestRow[];
}): StudentProfilePayload => {
  const programmeType = params.academic.programme_type ?? 'IB';
  const subjectList = params.subjects.map((subject) => {
    const rawGrade = subject.grade_value ?? '';
    const numericGrade = programmeType === 'IB' ? asNumber(rawGrade) : null;
    return {
      subject_name: subject.subject_name ?? '',
      level: subject.level ?? (programmeType === 'IB' ? 'HL' : 'A_LEVEL'),
      grade_value: programmeType === 'IB' ? numericGrade : rawGrade
    };
  });

  return {
    personal_information: {
      first_name: '',
      last_name: '',
      email: '',
      phone: null,
      nationality: '',
      age: null,
      gender: null,
      resident_country: '',
      current_location_city: null,
      time_zone: null
    },
    academic_input: {
      programme_type: programmeType,
      school_name: params.academic.school_name ?? '',
      school_country: params.academic.school_country ?? '',
      school_city: params.academic.school_city ?? null,
      school_type: params.academic.school_type ?? null,
      language_of_instruction: params.academic.language_of_instruction ?? null,
      graduation_year: params.academic.graduation_year ?? new Date().getFullYear(),
      desired_start_date: params.academic.desired_start_date ?? null,
      intended_clusters: (params.academic.intended_clusters ?? []) as StudentProfilePayload['academic_input']['intended_clusters'],
      secondary_clusters: (params.academic.secondary_clusters ?? []) as StudentProfilePayload['academic_input']['secondary_clusters'],
      career_aspiration: params.academic.career_aspiration ?? null,
      subject_list: subjectList,
      ib_total_points: params.academic.ib_total_points ?? null,
      ib_core_points: params.academic.ib_core_points ?? null,
      ib_tok_grade: params.academic.ib_tok_grade ?? null,
      ib_ee_grade: params.academic.ib_ee_grade ?? null,
      ib_math_pathway: params.academic.ib_math_pathway ?? null,
      ee_subject: params.academic.ee_subject ?? null,
      ee_title: params.academic.ee_title ?? null,
      ee_summary: params.academic.ee_summary ?? null,
      a_level_predicted_grades: (params.academic.a_level_predicted_grades ?? null) as StudentProfilePayload['academic_input']['a_level_predicted_grades'],
      english_required: params.academic.english_required ?? null,
      english_test_type: params.academic.english_test_type ?? 'NONE',
      english_status: params.academic.english_status ?? 'missing',
      english_score_overall: params.academic.english_score_overall ?? null,
      admissions_tests: params.admissionsTests.map((test) => ({
        test_type: test.test_type ?? 'NONE',
        status: test.status ?? 'missing',
        score_numeric: test.score_numeric ?? null,
        percentile: test.percentile ?? null
      }))
    },
    lifestyle_preference: {
      teaching_style: params.lifestyle?.teaching_style ?? null,
      desired_location_type: params.lifestyle?.desired_location_type ?? null,
      campus_size: params.lifestyle?.campus_size ?? null,
      extracurricular_interests: params.lifestyle?.extracurricular_interests ?? [],
      other_extracurriculars: params.lifestyle?.other_extracurriculars ?? null
    }
  };
};

const toTier = (value: unknown): 1 | 2 | 3 | 4 | 5 => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (parsed === 1 || parsed === 2 || parsed === 3 || parsed === 4 || parsed === 5) return parsed;
  return 5;
};

const toPlacementYear = (value: unknown, detail: string | null): string | null => {
  if (detail && detail.trim()) return detail.trim();
  if (typeof value === 'boolean') return value ? 'yes' : 'no';
  return asString(value);
};

const mapCourseScoringRow = (row: CourseScoringRow): CourseSource => {
  const universityScore = asNumber(row.university_score) ?? 0;
  const selectivityScore = asNumber(row.course_selectivity_score) ?? 0;
  const totalScore = asNumber(row.total_course_score) ?? Math.round(universityScore * 0.6 + selectivityScore * 0.4);
  const courseTier = toTier(row.course_tier);
  const genderRatio = row.gender_ratio_pct;
  const genderRatioText =
    typeof genderRatio === 'number' ? String(genderRatio) : asString(genderRatio);

  return {
    university: asString(row.university) ?? 'University',
    city: asString(row.city) ?? '',
    level: asString(row.level) ?? 'Undergraduate',
    degree_type: asString(row.degree_type) ?? asString(row.course) ?? 'Undergraduate degree',
    field_of_study: asString(row.field_of_study),
    course: asString(row.course) ?? 'Course',
    duration: asString(row.duration),
    qs_uk_rank: null,
    times_sunday_rank: null,
    guardian_rank: null,
    acceptance_rate_pct: asNumber(row.acceptance_rate_pct),
    nss_score_pct: asNumber(row.nss_score_pct),
    intake_size: asNumber(row.intake_size),
    gender_ratio_pct: genderRatioText,
    international_students_ratio_pct: asNumber(row.international_students_ratio_pct),
    student_to_staff_ratio: asNumber(row.student_to_staff_ratio),
    yearly_international_tuition_fee_gbp: asNumber(row.yearly_international_tuition_fee_gbp),
    student_dorm_cost_gbp_per_year: asNumber(row.student_dorm_cost_gbp_per_year),
    average_rent_outside_campus_gbp_per_month: asNumber(row.average_rent_outside_campus_gbp_per_month),
    cost_of_life: asCostOfLife(row.cost_of_life),
    min_ib_score: asNumber(row.min_ib_score),
    min_a_level_score: asString(row.min_a_level_score),
    preferred_subjects: asString(row.preferred_subjects),
    english_score_requirement: asString(row.english_score_requirement),
    course_online_page: asString(row.course_online_page),
    ucas_code: asString(row.ucas_code),
    ucas_deadline: asString(row.ucas_deadline),
    admission_test: asString(row.admission_test),
    interview: asString(row.interview),
    university_life: asString(row.university_life),
    number_of_students: asNumber(row.number_of_students),
    transport_accessibility: asString(row.transport_accessibility),
    cultural_social_environment: asString(row.cultural_social_environment),
    city_life: asString(row.city_life),
    climate: asString(row.climate),
    safety_index: asString(row.safety_index),
    study_abroad_option: asString(row.study_abroad_option),
    graduate_employment_rate_pct: asNumber(row.graduate_employment_rate_pct),
    average_starting_salary_gbp: asNumber(row.average_starting_salary_gbp),
    top_industries: asString(row.top_industries),
    placement_year: toPlacementYear(row.placement_year, asString(row.placement_year_detail)),
    university_score: Math.round(universityScore),
    course_selectivity_score: Math.round(selectivityScore),
    total_course_score: Math.round(totalScore),
    course_tier: courseTier,
    explanations: [
      `University ranking score: ${Math.round(universityScore)}/100`,
      `Course selectivity score: ${Math.round(selectivityScore)}/100`,
      `Total score: ${Math.round(totalScore)}/100`,
      `Tier ${courseTier} based on total score`
    ],
    program_id: String(row.program_id ?? row.course_id ?? ''),
    university_id: String(row.university_id ?? ''),
    program_level: asString(row.level),
    program_language: asString(row.program_language),
    program_mode: asString(row.program_mode),
    program_tuition: asNumber(row.program_tuition),
    program_currency: asString(row.program_currency),
    program_url: asString(row.program_url),
    university_country: asString(row.university_country) ?? 'United Kingdom',
    university_rank_overall: asNumber(row.university_rank_overall),
    university_rank_source: asString(row.university_rank_source),
    university_requires_test: row.university_requires_test ?? null
  };
};

const chunk = <T,>(items: T[], size: number): T[][] => {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
};

export const loadMatchesForProfile = async (
  supabase: Client,
  profileId: string,
  options: LoadMatchesOptions = {}
): Promise<MatchComputationResult> => {
  const programLimit = options.programLimit ?? 800;

  const [
    { data: academicData, error: academicError },
    { data: lifestyleData, error: lifestyleError },
    { data: subjectsData, error: subjectsError },
    { data: admissionsData, error: admissionsError }
  ] = await Promise.all([
    supabase.from('student_academic_input').select('*').eq('profile_id', profileId).maybeSingle(),
    supabase.from('student_lifestyle_preference').select('*').eq('profile_id', profileId).maybeSingle(),
    supabase.from('student_subjects').select('*').eq('profile_id', profileId),
    supabase.from('student_admissions_tests').select('*').eq('profile_id', profileId)
  ]);

  const profileErrors = [academicError, lifestyleError, subjectsError, admissionsError].filter(
    (err) => err && err.code !== 'PGRST116'
  );
  if (profileErrors.length > 0) {
    return {
      matches: [],
      catalogSize: { programs: 0, universities: 0 },
      missingSections: [],
      error: { stage: 'profile', message: 'Failed to load profile data' }
    };
  }

  const missingSections: MissingProfileSection[] = [];
  if (!academicData) missingSections.push('academic_input');
  if (!subjectsData || subjectsData.length === 0) missingSections.push('academic_details');
  if (!lifestyleData) missingSections.push('lifestyle_preferences');

  if (missingSections.length > 0) {
    return {
      matches: [],
      catalogSize: { programs: 0, universities: 0 },
      missingSections
    };
  }

  const programsData: ProgramSummaryRow[] = [];
  let offset = 0;
  while (programsData.length < programLimit) {
    const rangeFrom = offset;
    const rangeTo = Math.min(offset + PROGRAM_PAGE_SIZE - 1, programLimit - 1);
    let programQuery = supabase.from('programs').select('id,metadata');
    programQuery = applyProgramVisibilityFilters(programQuery).range(rangeFrom, rangeTo);
    const { data, error: programsError } = await programQuery;
    if (programsError) {
      console.error('Failed to load catalog data', { programsError });
      return {
        matches: [],
        catalogSize: { programs: 0, universities: 0 },
        missingSections,
        error: { stage: 'programs', message: 'Failed to load programs' }
      };
    }
    if (!data || data.length === 0) break;
    programsData.push(...data);
    if (data.length < PROGRAM_PAGE_SIZE) break;
    offset += PROGRAM_PAGE_SIZE;
  }

  if (programsData.length === 0) {
    return {
      matches: [],
      catalogSize: { programs: 0, universities: 0 },
      missingSections
    };
  }

  const normalizeMetadata = (value: unknown): Record<string, unknown> | null => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    return null;
  };

  const visibilityCheck = (programsData ?? []).map((p) => ({
    id: p.id,
    metadata: normalizeMetadata((p as any).metadata)
  }));
  const visibleIds = new Set(filterVisiblePrograms(visibilityCheck).map((p) => p.id));
  const filteredPrograms = (programsData ?? []).filter((p) => visibleIds.has(p.id));

  if (!filteredPrograms.length) {
    return {
      matches: [],
      catalogSize: { programs: filteredPrograms.length, universities: 0 },
      missingSections
    };
  }

  const programIds = filteredPrograms.map((program) => program.id);

  const courseColumns = [
    'course_id',
    'program_id',
    'university_id',
    'university',
    'course',
    'city',
    'ucas_code',
    'level',
    'degree_type',
    'field_of_study',
    'duration',
    'acceptance_rate_pct',
    'nss_score_pct',
    'intake_size',
    'gender_ratio_pct',
    'international_students_ratio_pct',
    'student_to_staff_ratio',
    'yearly_international_tuition_fee_gbp',
    'student_dorm_cost_gbp_per_year',
    'average_rent_outside_campus_gbp_per_month',
    'cost_of_life',
    'min_ib_score',
    'min_a_level_score',
    'preferred_subjects',
    'english_score_requirement',
    'course_online_page',
    'ucas_deadline',
    'admission_test',
    'interview',
    'university_life',
    'number_of_students',
    'transport_accessibility',
    'cultural_social_environment',
    'city_life',
    'climate',
    'safety_index',
    'study_abroad_option',
    'graduate_employment_rate_pct',
    'average_starting_salary_gbp',
    'top_industries',
    'placement_year',
    'placement_year_detail',
    'program_language',
    'program_mode',
    'program_tuition',
    'program_currency',
    'program_url',
    'university_country',
    'university_rank_overall',
    'university_rank_source',
    'university_requires_test',
    'university_score',
    'course_selectivity_score',
    'total_course_score',
    'course_tier'
  ].join(',');

  const courseRows: CourseScoringRow[] = [];
  for (const batch of chunk(programIds, 200)) {
    const { data, error } = await supabase
      .from('course_scoring_v1')
      .select(courseColumns)
      .in('course_id', batch);
    if (error) {
      console.error('Failed to load catalog data', { courseScoringError: error });
      return {
        matches: [],
        catalogSize: { programs: filteredPrograms.length, universities: 0 },
        missingSections,
        error: { stage: 'programs', message: 'Failed to load course scoring view' }
      };
    }
    courseRows.push(...(data ?? []));
  }

  if (!courseRows.length) {
    return {
      matches: [],
      catalogSize: { programs: filteredPrograms.length, universities: 0 },
      missingSections,
      error: { stage: 'programs', message: 'Course scoring view returned no rows' }
    };
  }

  const enrichedCourses = courseRows.map(mapCourseScoringRow);

  const universitiesCount = new Set(enrichedCourses.map((course) => course.university_id)).size;

  const studentPayload = buildStudentPayload({
    academic: academicData!,
    lifestyle: lifestyleData ?? null,
    subjects: (subjectsData ?? []) as StudentSubjectRow[],
    admissionsTests: (admissionsData ?? []) as StudentAdmissionsTestRow[]
  });
  const studentScore = scoreStudentProfile(studentPayload);
  const { error: scorePersistError } = await supabase.from('student_scores').upsert({
    profile_id: profileId,
    total_score: studentScore.total_score,
    student_band: studentScore.student_band,
    eligibility_flags: studentScore.eligibility_flags,
    readiness_flags: studentScore.readiness_flags,
    breakdown: studentScore.breakdown
  });
  if (scorePersistError) {
    console.warn('Failed to persist student score', scorePersistError);
  }
  const ranked = rankCourseMatches(studentPayload, studentScore, enrichedCourses)
    .filter((match) => !match.excluded);
  const limited = options.resultLimit ? ranked.slice(0, options.resultLimit) : ranked;

  const toKey = (value: { university: string; course: string; ucas_code?: string | null }) =>
    `${value.university}::${value.course}::${value.ucas_code ?? ''}`;
  const courseLookup = new Map(enrichedCourses.map((course) => [toKey(course), course]));
  const courseByProgramId = new Map(enrichedCourses.map((course) => [course.program_id, course]));

  const assignTier = (chance: number): MatchTier =>
    chance > 75 ? 'Safe' : chance >= 50 ? 'Match' : 'Reach';

  let matches: EnrichedMatch[] = limited
    .map((match) => {
      const course =
        (match.program_id ? courseByProgramId.get(match.program_id) : null) ??
        courseLookup.get(toKey(match));
      if (!course) return null;
      const tier: MatchTier = assignTier(match.chance_percent);
      return {
        program: {
          id: course.program_id,
          name: course.course,
          field: course.field_of_study ?? null,
          level: course.program_level ?? course.level ?? null,
          language: course.program_language ?? null,
          mode: course.program_mode ?? null,
          tuition: course.program_tuition ?? null,
          currency: course.program_currency ?? null,
          url: course.program_url ?? null
        },
        university: {
          id: course.university_id,
          name: course.university,
          country: course.university_country,
          rankOverall: course.university_rank_overall,
          rankSource: course.university_rank_source,
          requiresTest: course.university_requires_test ?? null
        },
        score: match.chance_percent,
        breakdown: {
          eligibility: match.excluded ? 0 : 100,
          academicFit: Math.min(100, Math.round(studentScore.total_score / 2)),
          preferenceFit: 0,
          outcomes: course.total_course_score
        },
        blockingReasons: match.reasons,
        tier
      } as EnrichedMatch;
    })
    .filter((value): value is EnrichedMatch => value !== null);

  if (matches.length > 0) {
    const sortedByScore = [...matches].sort((a, b) => a.score - b.score);

    if (!matches.some((match) => match.tier === 'Reach')) {
      const reachCount = Math.max(1, Math.floor(matches.length * 0.2));
      const reachIds = new Set(sortedByScore.slice(0, reachCount).map((match) => match.program.id));
      matches = matches.map((match) => (reachIds.has(match.program.id) ? { ...match, tier: 'Reach' } : match));
    }

    if (!matches.some((match) => match.tier === 'Match')) {
      const matchCount = Math.max(1, Math.floor(matches.length * 0.2));
      const startIndex = Math.max(0, Math.floor((matches.length - matchCount) / 2));
      const matchIds = new Set(
        sortedByScore
          .slice(startIndex, startIndex + matchCount)
          .map((match) => match.program.id)
      );
      matches = matches.map((match) => (matchIds.has(match.program.id) ? { ...match, tier: 'Match' } : match));
    }
  }

  return {
    matches,
    catalogSize: { programs: filteredPrograms.length, universities: universitiesCount },
    missingSections
  };
};
