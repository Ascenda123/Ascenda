export type CostOfLife = 'HIGH' | 'MEDIUM' | 'LOW';

export interface CourseRecord {
  university: string;
  city: string;
  level: string;
  degree_type: string;
  field_of_study: string | null;
  course: string;
  duration: string | null;
  qs_uk_rank: number | null;
  times_sunday_rank: number | null;
  guardian_rank: number | null;
  acceptance_rate_pct: number | null;
  nss_score_pct: number | null;
  intake_size: number | null;
  gender_ratio_pct: string | null;
  international_students_ratio_pct: number | null;
  student_to_staff_ratio: number | null;
  yearly_international_tuition_fee_gbp: number | null;
  student_dorm_cost_gbp_per_year: number | null;
  average_rent_outside_campus_gbp_per_month: number | null;
  cost_of_life: CostOfLife | null;
  min_ib_score: number | null;
  min_a_level_score: string | null;
  preferred_subjects: string | null;
  english_score_requirement: string | null;
  course_online_page: string | null;
  ucas_code: string | null;
  ucas_deadline: string | null;
  admission_test: string | null;
  interview: string | null;
  university_life: string | null;
  number_of_students: number | null;
  transport_accessibility: string | null;
  cultural_social_environment: string | null;
  city_life: string | null;
  climate: string | null;
  safety_index: string | null;
  study_abroad_option: string | null;
  graduate_employment_rate_pct: number | null;
  average_starting_salary_gbp: number | null;
  top_industries: string | null;
  placement_year: string | null;
}

export interface EnrichedCourseRecord extends CourseRecord {
  university_score: number;
  course_selectivity_score: number;
  total_course_score: number;
  course_tier: 1 | 2 | 3 | 4 | 5;
  explanations: string[];
}

const rankToBand = (rank: number | null): number | null => {
  if (rank === null || rank === undefined) return null;
  if (rank <= 5) return 100;
  if (rank <= 10) return 95;
  if (rank <= 20) return 85;
  if (rank <= 30) return 75;
  if (rank <= 40) return 65;
  if (rank <= 60) return 55;
  if (rank <= 80) return 45;
  if (rank <= 100) return 35;
  return 25;
};

const average = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

export const computeUniversityScore = (course: CourseRecord): number => {
  const bandScores = [course.qs_uk_rank, course.times_sunday_rank, course.guardian_rank]
    .map(rankToBand)
    .filter((value): value is number => typeof value === 'number');
  if (!bandScores.length) {
    return 30;
  }
  return Math.round(average(bandScores));
};

export const mapIbRequirementScore = (minIbScore: number | null): number => {
  if (minIbScore === null || minIbScore === undefined) return 40;
  if (minIbScore >= 40) return 100;
  if (minIbScore >= 38) return 90;
  if (minIbScore >= 36) return 80;
  if (minIbScore >= 34) return 70;
  if (minIbScore >= 32) return 60;
  if (minIbScore >= 30) return 50;
  if (minIbScore >= 28) return 40;
  return 30;
};

const normalizeALevel = (value: string | null) =>
  value ? value.replace(/\s+/g, '').toUpperCase() : '';

export const mapALevelRequirementScore = (minALevelScore: string | null): number => {
  const normalized = normalizeALevel(minALevelScore);
  if (!normalized) return 40;
  if (normalized.includes('A*AA') || normalized.includes('A*A*A') || normalized.includes('A*A*A*')) return 100;
  if (normalized === 'AAA') return 90;
  if (normalized === 'AAB') return 80;
  if (normalized === 'ABB') return 70;
  if (normalized === 'BBB') return 60;
  if (normalized === 'BBC') return 50;
  if (normalized === 'BCC') return 40;
  return 30;
};

export const computeCourseSelectivityScore = (course: CourseRecord): number => {
  const ibScore = mapIbRequirementScore(course.min_ib_score);
  const aLevelScore = mapALevelRequirementScore(course.min_a_level_score);
  const hasIb = course.min_ib_score !== null && course.min_ib_score !== undefined;
  const hasALevel = course.min_a_level_score !== null && course.min_a_level_score !== undefined;
  if (hasIb && hasALevel) {
    return Math.round(average([ibScore, aLevelScore]));
  }
  if (hasIb) return ibScore;
  if (hasALevel) return aLevelScore;
  return 40;
};

export const computeCourseTier = (totalScore: number): 1 | 2 | 3 | 4 | 5 => {
  if (totalScore >= 85) return 1;
  if (totalScore >= 75) return 2;
  if (totalScore >= 65) return 3;
  if (totalScore >= 50) return 4;
  return 5;
};

export const enrichCourseRecord = (course: CourseRecord): EnrichedCourseRecord => {
  const university_score = computeUniversityScore(course);
  const course_selectivity_score = computeCourseSelectivityScore(course);
  const total_course_score = Math.round(university_score * 0.6 + course_selectivity_score * 0.4);
  const course_tier = computeCourseTier(total_course_score);

  const explanations = [
    `University ranking score: ${university_score}/100`,
    `Course selectivity score: ${course_selectivity_score}/100`,
    `Total score: ${total_course_score}/100`,
    `Tier ${course_tier} based on total score`
  ];

  return {
    ...course,
    university_score,
    course_selectivity_score,
    total_course_score,
    course_tier,
    explanations
  };
};

export const enrichCourseRecords = (courses: CourseRecord[]): EnrichedCourseRecord[] =>
  courses.map(enrichCourseRecord);
