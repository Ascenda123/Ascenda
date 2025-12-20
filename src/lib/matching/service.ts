import type { SupabaseClient } from '@supabase/supabase-js';
import type { MatchingWeights } from './config';
import { filterVisiblePrograms, getFlaggedProgramIds } from '../catalog/visibility';
import type { Database } from '../types/database';
import type { EnrichedMatch, MissingProfileSection } from './types';
import type { MatchTier } from './match-tier';
import type { StudentProfilePayload } from '@/lib/profile/intake-types';
import { scoreStudentProfile } from '@/lib/scoring/student_scoring';
import { enrichCourseRecords, type CourseRecord } from '@/lib/tiering/course_tiering';
import { rankCourseMatches } from '@/lib/matching/matching_engine';

type StudentAcademicInputRow = Database['public']['Tables']['student_academic_input']['Row'];
type StudentLifestyleRow = Database['public']['Tables']['student_lifestyle_preference']['Row'];
type StudentSubjectRow = Database['public']['Tables']['student_subjects']['Row'];
type StudentAdmissionsTestRow = Database['public']['Tables']['student_admissions_tests']['Row'];
type ProgramRow = Database['public']['Tables']['programs']['Row'];
type UniversityRow = Database['public']['Tables']['universities']['Row'];
type ProgramRequirementRow = Database['public']['Tables']['program_requirements']['Row'];

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

const extractAdmissionTests = (value: string | null): string | null => {
  if (!value) return null;
  const upper = value.toUpperCase();
  const tests = ['LNAT', 'UCAT', 'TMUA', 'MAT', 'STEP', 'ESAT', 'TSA'].filter((test) => upper.includes(test));
  return tests.length ? tests.join(', ') : null;
};

const gradeValueMap: Record<string, number> = {
  'A*': 7,
  A: 6,
  B: 5,
  C: 4,
  D: 3,
  E: 2,
  U: 1
};

const extractALevelProfiles = (value: string | null): string[] => {
  if (!value) return [];
  const matches = value.toUpperCase().match(/A\*AA|AAA|AAB|ABB|BBB|BBC|BCC|CCC|CCD|DDD|EEE/g);
  return matches ?? [];
};

const profileToScore = (profile: string) =>
  (profile.match(/A\*|A|B|C|D|E|U/g) ?? [])
    .slice(0, 3)
    .reduce((sum, grade) => sum + (gradeValueMap[grade] ?? 0), 0);

const selectLenientALevel = (value: string | null): string | null => {
  const profiles = extractALevelProfiles(value);
  if (!profiles.length) return null;
  return profiles.reduce((lowest, current) => (profileToScore(current) < profileToScore(lowest) ? current : lowest));
};

const extractIbTotal = (value: string | null): number | null => {
  if (!value) return null;
  const match = value.match(/(\d{2})/);
  if (!match) return null;
  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed)) return null;
  if (/higher level|hl/i.test(value) && parsed <= 21) return null;
  if (parsed < 24 || parsed > 45) return null;
  return parsed;
};

type CourseSource = CourseRecord & {
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

const buildCourseRecords = (params: {
  programs: ProgramRow[];
  universities: UniversityRow[];
  requirements: ProgramRequirementRow[];
}): CourseSource[] => {
  const universityMap = new Map(params.universities.map((uni) => [uni.id, uni]));
  const requirementMap = new Map(params.requirements.map((req) => [req.program_id, req]));
  return params.programs.map((program) => {
    const university = universityMap.get(program.university_id);
    const requirement = requirementMap.get(program.id);
    const universityMetadata = (university?.metadata ?? null) as Record<string, unknown> | null;
    const programMetadata = (program.metadata ?? null) as Record<string, unknown> | null;
    const qsRank = asNumber(universityMetadata?.qs_uk_rank ?? universityMetadata?.qs_rank ?? universityMetadata?.qs);
    const timesRank = asNumber(universityMetadata?.times_sunday_rank ?? universityMetadata?.times_rank);
    const guardianRank = asNumber(universityMetadata?.guardian_rank);
    const nssScore = asNumber(programMetadata?.nss_score_pct ?? program.student_satisfaction);
    const intakeSize = asNumber(programMetadata?.intake_size);
    const studentToStaff = asNumber(programMetadata?.student_to_staff_ratio);
    const internationalRatio = asNumber(programMetadata?.international_students_ratio_pct);
    const costOfLife = asCostOfLife(universityMetadata?.cost_of_life ?? programMetadata?.cost_of_life);

    const ibFromProgram = extractIbTotal(asString(program.min_ib));
    const ibFromOverview = extractIbTotal(asString(program.entry_requirements_overview));
    const minIbScore =
      asNumber(requirement?.min_ib_total) ?? ibFromProgram ?? ibFromOverview;
    const minALevelScore =
      selectLenientALevel(asString(program.min_alevel)) ??
      selectLenientALevel(asString(program.entry_requirements_overview));

    const admissionTest = extractAdmissionTests(program.additional_entry_requirements ?? program.entry_requirements_overview ?? null);

    const duration = asString(program.duration) ?? (program.duration_years ? `${program.duration_years} years` : null);
    const tuition = asNumber(program.tuition ?? program.tuition_fees_international);

    return {
      university: university?.name ?? 'University',
      city: university?.city ?? '',
      level: program.study_level ?? program.level ?? 'Undergraduate',
      degree_type: program.name ?? program.course_name ?? 'Undergraduate degree',
      field_of_study: program.field ?? null,
      course: program.course_name ?? program.name ?? 'Course',
      duration,
      qs_uk_rank: qsRank,
      times_sunday_rank: timesRank,
      guardian_rank: guardianRank,
      acceptance_rate_pct: asNumber(university?.acceptance_rate),
      nss_score_pct: nssScore,
      intake_size: intakeSize,
      gender_ratio_pct: asString(programMetadata?.gender_ratio_pct) ?? null,
      international_students_ratio_pct: internationalRatio,
      student_to_staff_ratio: studentToStaff,
      yearly_international_tuition_fee_gbp: tuition,
      student_dorm_cost_gbp_per_year: asNumber(universityMetadata?.student_dorm_cost_gbp_per_year ?? programMetadata?.student_dorm_cost_gbp_per_year),
      average_rent_outside_campus_gbp_per_month: asNumber(
        universityMetadata?.average_rent_outside_campus_gbp_per_month ?? programMetadata?.average_rent_outside_campus_gbp_per_month
      ),
      cost_of_life: costOfLife,
      min_ib_score: minIbScore,
      min_a_level_score: minALevelScore,
      preferred_subjects: asString(program.subject_requirements),
      english_score_requirement: asString(program.english_requirements),
      course_online_page: program.provider_course_url ?? program.url ?? null,
      ucas_code: program.ucas_code ?? null,
      ucas_deadline: asString(program.start_date),
      admission_test: admissionTest,
      interview: asString(programMetadata?.interview),
      university_life: asString(programMetadata?.university_life),
      number_of_students: asNumber(universityMetadata?.number_of_students),
      transport_accessibility: asString(universityMetadata?.transport_accessibility),
      cultural_social_environment: asString(universityMetadata?.cultural_social_environment),
      city_life: asString(universityMetadata?.city_life),
      climate: asString(universityMetadata?.climate),
      safety_index: asString(universityMetadata?.safety_index),
      study_abroad_option: asString(programMetadata?.study_abroad_option),
      graduate_employment_rate_pct: asNumber(programMetadata?.graduate_employment_rate_pct ?? program.employment_after_course),
      average_starting_salary_gbp: asNumber(program.average_salary_after_15m),
      top_industries: asString(programMetadata?.top_industries),
      placement_year: asString(programMetadata?.placement_year),
      program_id: program.id,
      university_id: university?.id ?? '',
      program_level: program.study_level ?? program.level ?? null,
      program_language: program.language ?? null,
      program_mode: program.mode ?? null,
      program_tuition: tuition,
      program_currency: program.currency ?? null,
      program_url: program.provider_course_url ?? program.url ?? null,
      university_country: university?.country ?? 'United Kingdom',
      university_rank_overall: university?.rank_overall ?? null,
      university_rank_source: university?.rank_source ?? null,
      university_requires_test: university?.requires_test ?? null
    };
  });
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

  const programsData: ProgramRow[] = [];
  let offset = 0;
  while (programsData.length < programLimit) {
    const rangeFrom = offset;
    const rangeTo = Math.min(offset + PROGRAM_PAGE_SIZE - 1, programLimit - 1);
    let programQuery = supabase.from('programs').select('*');
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

  const universityIds = filteredPrograms.map((program) => program.university_id);
  const programIds = filteredPrograms.map((program) => program.id);

  const universitiesData: UniversityRow[] = [];
  for (const batch of chunk(Array.from(new Set(universityIds)), 500)) {
    const { data, error } = await supabase
      .from('universities')
      .select('id,name,country,region,rank_overall,rank_source,acceptance_rate,requires_test,metadata,city')
      .in('id', batch);
    if (error) {
      console.error('Failed to load catalog data', { universitiesError: error });
      return {
        matches: [],
        catalogSize: { programs: filteredPrograms.length, universities: 0 },
        missingSections,
        error: {
          stage: 'universities',
          message: 'Failed to load universities'
        }
      };
    }
    universitiesData.push(...(data ?? []));
  }

  const requirementsData: ProgramRequirementRow[] = [];
  for (const batch of chunk(programIds, 500)) {
    const { data, error } = await supabase
      .from('program_requirements')
      .select('program_id,min_ib_total')
      .in('program_id', batch);
    if (error) {
      console.warn('Requirements lookup failed, continuing without requirements data', error.message);
      break;
    }
    requirementsData.push(...(data ?? []));
  }

  if (!universitiesData.length) {
    return {
      matches: [],
      catalogSize: { programs: filteredPrograms.length, universities: 0 },
      missingSections,
      error: { stage: 'universities', message: 'Failed to load universities' }
    };
  }

  if (!filteredPrograms.length) {
    return {
      matches: [],
      catalogSize: { programs: filteredPrograms.length, universities: universitiesData.length },
      missingSections
    };
  }

  const courseRecords = buildCourseRecords({
    programs: filteredPrograms,
    universities: universitiesData,
    requirements: requirementsData
  });
  const enrichedCourses = enrichCourseRecords(courseRecords).map((course, index) => ({
    ...courseRecords[index],
    ...course
  }));

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

  const matches: EnrichedMatch[] = limited
    .map((match) => {
      const course =
        (match.program_id ? courseByProgramId.get(match.program_id) : null) ??
        courseLookup.get(toKey(match));
      if (!course) return null;
      const tier: MatchTier =
        match.tier_fit === 'Safety'
          ? 'Safe'
          : match.tier_fit === 'Target'
            ? 'Match'
            : match.chance_category === 'Very likely'
              ? 'Safe'
              : match.chance_category === 'Likely' || match.chance_category === 'Possible'
                ? 'Match'
                : 'Reach';
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

  return {
    matches,
    catalogSize: { programs: filteredPrograms.length, universities: universitiesData?.length ?? 0 },
    missingSections
  };
};
