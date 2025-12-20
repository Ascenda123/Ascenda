import type { StudentProfilePayload } from '@/lib/profile/intake-types';
import type { StudentScoreResult } from '@/lib/scoring/student_scoring';
import type { EnrichedCourseRecord } from '@/lib/tiering/course_tiering';

export interface PreferencesFilters {
  city_in?: string[];
  max_yearly_fee_gbp?: number;
  cost_of_life_in?: Array<'HIGH' | 'MEDIUM' | 'LOW'>;
  min_nss_score_pct?: number;
  intake_size_min?: number;
  intake_size_max?: number;
  max_student_to_staff_ratio?: number;
  placement_year_required?: boolean;
  average_starting_salary_min_gbp?: number;
  university_life_in?: string[];
}

export interface RankedCourseMatch {
  university: string;
  course: string;
  ucas_code: string | null;
  program_id?: string;
  university_id?: string;
  course_tier: 1 | 2 | 3 | 4 | 5;
  tier_fit: 'Safety' | 'Target' | 'Reach' | 'Harder-than-reach';
  chance_percent: number;
  chance_category: 'Very likely' | 'Likely' | 'Possible' | 'Stretch' | 'Unlikely';
  reasons: string[];
  excluded: boolean;
}

const gradeValueMap: Record<string, number> = {
  'A*': 10,
  A: 8,
  B: 6,
  C: 4,
  D: 2,
  E: 1,
  U: 0
};

const parseALevelProfile = (value: string | null): string[] | null => {
  if (!value) return null;
  const matches = value.toUpperCase().match(/A\*|A|B|C|D|E|U/g);
  if (!matches || matches.length === 0) return null;
  return matches.slice(0, 3);
};

const normalizeTestRequirement = (value: string | null) =>
  value ? value.toUpperCase().replace(/\s+/g, '') : '';

const computeBestALevelGrades = (student: StudentProfilePayload): string[] | null => {
  const grades = student.academic_input.a_level_predicted_grades;
  const gradeValues =
    grades && Object.keys(grades).length
      ? Object.values(grades)
      : student.academic_input.subject_list
        .filter((subject) => subject.level === 'A_LEVEL')
        .map((subject) => (typeof subject.grade_value === 'string' ? subject.grade_value : ''));
  const normalized = gradeValues
    .map((grade) => grade.toUpperCase())
    .filter((grade) => gradeValueMap[grade]);
  if (normalized.length === 0) return null;
  const sorted = normalized.sort((a, b) => gradeValueMap[b] - gradeValueMap[a]);
  return sorted.slice(0, 3);
};

const compareGradeProfiles = (studentGrades: string[] | null, requiredGrades: string[] | null) => {
  if (!studentGrades || studentGrades.length === 0 || !requiredGrades || requiredGrades.length === 0) return null;
  const studentValues = studentGrades.map((grade) => gradeValueMap[grade] ?? 0).sort((a, b) => b - a);
  const requiredValues = requiredGrades.map((grade) => gradeValueMap[grade] ?? 0).sort((a, b) => b - a);
  const length = Math.min(studentValues.length, requiredValues.length);

  let studentIsBetter = false;
  for (let i = 0; i < length; i += 1) {
    // If student grade is lower than required grade at any position, they fail the profile requirement
    if (studentValues[i] < requiredValues[i]) return -1;
    if (studentValues[i] > requiredValues[i]) studentIsBetter = true;
  }
  return studentIsBetter ? 1 : 0;
};

const filterCourses = (courses: EnrichedCourseRecord[], filters?: PreferencesFilters) => {
  if (!filters) return courses;
  return courses.filter((course) => {
    if (filters.city_in?.length && course.city && !filters.city_in.includes(course.city)) return false;
    if (filters.max_yearly_fee_gbp !== undefined && course.yearly_international_tuition_fee_gbp !== null) {
      if (course.yearly_international_tuition_fee_gbp > filters.max_yearly_fee_gbp) return false;
    }
    if (filters.cost_of_life_in?.length && course.cost_of_life && !filters.cost_of_life_in.includes(course.cost_of_life)) {
      return false;
    }
    if (filters.min_nss_score_pct !== undefined && course.nss_score_pct !== null) {
      if (course.nss_score_pct < filters.min_nss_score_pct) return false;
    }
    if (filters.intake_size_min !== undefined && course.intake_size !== null) {
      if (course.intake_size < filters.intake_size_min) return false;
    }
    if (filters.intake_size_max !== undefined && course.intake_size !== null) {
      if (course.intake_size > filters.intake_size_max) return false;
    }
    if (filters.max_student_to_staff_ratio !== undefined && course.student_to_staff_ratio !== null) {
      if (course.student_to_staff_ratio > filters.max_student_to_staff_ratio) return false;
    }
    if (filters.placement_year_required && course.placement_year !== null) {
      if (!course.placement_year || course.placement_year.toLowerCase() === 'no') return false;
    }
    if (filters.average_starting_salary_min_gbp !== undefined && course.average_starting_salary_gbp !== null) {
      if (course.average_starting_salary_gbp < filters.average_starting_salary_min_gbp) return false;
    }
    if (filters.university_life_in?.length && course.university_life && !filters.university_life_in.includes(course.university_life)) {
      return false;
    }
    return true;
  });
};

const tierFitMap: Record<
  StudentScoreResult['student_band'],
  { reach: Array<1 | 2 | 3 | 4 | 5>; target: Array<1 | 2 | 3 | 4 | 5>; safety: Array<1 | 2 | 3 | 4 | 5> }
> = {
  Exceptional: { reach: [1], target: [1, 2], safety: [3, 4, 5] },
  'Very strong': { reach: [1], target: [2], safety: [3, 4, 5] },
  Strong: { reach: [1, 2], target: [3], safety: [4, 5] },
  Solid: { reach: [2], target: [3, 4], safety: [5] },
  Borderline: { reach: [3], target: [4], safety: [5] },
  Weak: { reach: [4], target: [5], safety: [] }
};

const resolveTierFit = (band: StudentScoreResult['student_band'], tier: 1 | 2 | 3 | 4 | 5, academicScore: number): RankedCourseMatch['tier_fit'] => {
  const mapping = tierFitMap[band];

  // Heavily weigh academic score for high-performing students
  // If academic performance alone is elite (>90 pts), treat Tier 1/2 as Target and Tier 3+ as Safety
  if (academicScore >= 90) {
    if (tier <= 2) return 'Target';
    return 'Safety';
  }

  if (mapping.safety.includes(tier)) return 'Safety';
  if (mapping.target.includes(tier)) return 'Target';
  if (mapping.reach.includes(tier)) return 'Reach';

  // Fallback: If it's not explicitly mapped, check if it's "easier" than Safety or "harder" than Reach
  const maxSafety = mapping.safety.length > 0 ? Math.max(...mapping.safety) : 0;
  if (tier > maxSafety && maxSafety > 0) return 'Safety';

  const minReach = mapping.reach.length > 0 ? Math.min(...mapping.reach) : 6;
  if (tier < minReach) return 'Harder-than-reach';

  return 'Harder-than-reach';
};

const baselineChance: Record<RankedCourseMatch['tier_fit'], number> = {
  Safety: 80,
  Target: 60,
  Reach: 35,
  'Harder-than-reach': 15
};

const clampChance = (value: number) => Math.max(5, Math.min(95, Math.round(value)));

export const rankCourseMatches = (
  student: StudentProfilePayload,
  score: StudentScoreResult,
  courses: EnrichedCourseRecord[],
  filters?: PreferencesFilters
): RankedCourseMatch[] => {
  const filtered = filterCourses(courses, filters);
  const studentProgramme = student.academic_input.programme_type;
  const studentIbTotal = student.academic_input.ib_total_points ?? null;
  const studentEnglishRequired = student.academic_input.english_required === true;
  const studentEnglishStatus = student.academic_input.english_status;
  const studentTests = student.academic_input.admissions_tests ?? [];
  const studentTestsByType = new Map(studentTests.map((test) => [test.test_type, test.status]));

  const bestALevelGrades = computeBestALevelGrades(student);
  const bestALevelProfile = bestALevelGrades ? bestALevelGrades.join('') : null;
  const bestALevelValues = bestALevelGrades?.map((grade) => gradeValueMap[grade] ?? 0).sort((a, b) => b - a) ?? [];
  const bestALevelSum = bestALevelValues.reduce((sum, value) => sum + value, 0);

  const matches = filtered.map((course) => {
    const reasons: string[] = [];
    let excluded = false;

    if (studentProgramme === 'IB' && course.min_ib_score !== null) {
      if (studentIbTotal === null) {
        excluded = true;
        reasons.push('Missing IB total points for entry requirements.');
      } else if (studentIbTotal < course.min_ib_score) {
        excluded = true;
        reasons.push(`IB total ${studentIbTotal} below requirement ${course.min_ib_score}.`);
      } else {
        reasons.push(`Meets IB requirement (${studentIbTotal}/${course.min_ib_score}).`);
      }
    }

    if (studentProgramme === 'A_LEVEL' && course.min_a_level_score) {
      const required = parseALevelProfile(course.min_a_level_score);
      const comparison = compareGradeProfiles(bestALevelGrades, required);
      if (!bestALevelGrades) {
        excluded = true;
        reasons.push('Missing A-level grades for entry requirements.');
      } else if (comparison === -1) {
        excluded = true;
        reasons.push(`A-level profile ${bestALevelProfile ?? 'N/A'} below requirement ${course.min_a_level_score}.`);
      } else {
        reasons.push(`Meets A-level requirement (${bestALevelProfile}/${course.min_a_level_score}).`);
      }
    }

    const admissionRequirement = normalizeTestRequirement(course.admission_test);
    if (admissionRequirement) {
      const requiredTests = ['LNAT', 'UCAT', 'TMUA', 'MAT', 'STEP', 'ESAT', 'TSA'].filter((test) =>
        admissionRequirement.includes(test)
      );
      requiredTests.forEach((test) => {
        const status = studentTestsByType.get(test as any);
        if (!status || status === 'missing') {
          excluded = true;
          reasons.push(`${test} required but not booked or taken.`);
        }
      });
    }

    let englishPenalty = 0;
    if (course.english_score_requirement && studentEnglishRequired) {
      if (studentEnglishStatus === 'missing' || studentEnglishStatus === 'failed') {
        englishPenalty = -25;
        reasons.push('Not ready: English test missing.');
      }
    }

    const tier_fit = resolveTierFit(score.student_band, course.course_tier, score.breakdown.academic_performance);
    let chance = baselineChance[tier_fit];

    if (studentProgramme === 'IB' && studentIbTotal !== null && course.min_ib_score !== null) {
      const margin = studentIbTotal - course.min_ib_score;
      if (margin >= 4) chance += 15;
      else if (margin >= 2) chance += 10;
      else if (margin >= 0) chance += 5;
      else if (margin === -1) chance -= 15;
      else if (margin <= -2) chance -= 25;
    }

    if (studentProgramme === 'A_LEVEL' && course.min_a_level_score && bestALevelGrades) {
      const requiredGrades = parseALevelProfile(course.min_a_level_score);
      const requiredValues = requiredGrades?.map((grade) => gradeValueMap[grade] ?? 0).sort((a, b) => b - a) ?? [];
      const requiredSum = requiredValues.reduce((sum, value) => sum + value, 0);
      const margin = bestALevelSum - requiredSum;
      if (margin >= 4) chance += 15;
      else if (margin >= 2) chance += 10;
      else if (margin >= 0) chance += 5;
      else if (margin === -1) chance -= 15;
      else if (margin <= -2) chance -= 25;
    }

    if (score.breakdown.preferred_subjects_alignment >= 15) {
      chance += 8;
      reasons.push('Strong subject alignment.');
    }
    if (score.breakdown.rigour_score >= 12) {
      chance += 6;
      reasons.push('High subject rigour.');
    }
    if (score.breakdown.tests_and_english >= 16) {
      chance += 8;
      reasons.push('Strong test/English readiness.');
    }

    chance += englishPenalty;
    if (excluded) {
      chance = 5;
    }

    const chance_percent = clampChance(chance);
    const chance_category: RankedCourseMatch['chance_category'] =
      chance_percent >= 80
        ? 'Very likely'
        : chance_percent >= 65
          ? 'Likely'
          : chance_percent >= 45
            ? 'Possible'
            : chance_percent >= 25
              ? 'Stretch'
              : 'Unlikely';

    return {
      university: course.university,
      course: course.course,
      ucas_code: course.ucas_code ?? null,
      program_id: (course as { program_id?: string }).program_id,
      university_id: (course as { university_id?: string }).university_id,
      course_tier: course.course_tier,
      tier_fit,
      chance_percent,
      chance_category,
      reasons,
      excluded
    };
  });

  return matches.sort((a, b) => {
    if (b.chance_percent !== a.chance_percent) return b.chance_percent - a.chance_percent;
    const courseA = courses.find((course) => course.university === a.university && course.course === a.course);
    const courseB = courses.find((course) => course.university === b.university && course.course === b.course);
    if (courseA && courseB && courseB.total_course_score !== courseA.total_course_score) {
      return courseB.total_course_score - courseA.total_course_score;
    }
    const feeA = courseA?.yearly_international_tuition_fee_gbp ?? Number.POSITIVE_INFINITY;
    const feeB = courseB?.yearly_international_tuition_fee_gbp ?? Number.POSITIVE_INFINITY;
    if (feeA !== feeB) return feeA - feeB;
    const uniA = courseA?.university_score ?? 0;
    const uniB = courseB?.university_score ?? 0;
    return uniB - uniA;
  });
};
