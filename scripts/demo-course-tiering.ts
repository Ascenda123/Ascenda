import { enrichCourseRecords, type CourseRecord } from '@/lib/tiering/course_tiering';

const baseCourse: CourseRecord = {
  university: 'Example University',
  city: 'London',
  level: 'Undergraduate',
  degree_type: 'BSc (Hons)',
  field_of_study: 'Computer Science',
  course: 'Computer Science',
  duration: '3 years',
  qs_uk_rank: null,
  times_sunday_rank: null,
  guardian_rank: null,
  acceptance_rate_pct: null,
  nss_score_pct: null,
  intake_size: null,
  gender_ratio_pct: null,
  international_students_ratio_pct: null,
  student_to_staff_ratio: null,
  yearly_international_tuition_fee_gbp: null,
  student_dorm_cost_gbp_per_year: null,
  average_rent_outside_campus_gbp_per_month: null,
  cost_of_life: null,
  min_ib_score: null,
  min_a_level_score: null,
  preferred_subjects: null,
  english_score_requirement: null,
  course_online_page: null,
  ucas_code: null,
  ucas_deadline: null,
  admission_test: null,
  interview: null,
  university_life: null,
  number_of_students: null,
  transport_accessibility: null,
  cultural_social_environment: null,
  city_life: null,
  climate: null,
  safety_index: null,
  study_abroad_option: null,
  graduate_employment_rate_pct: null,
  average_starting_salary_gbp: null,
  top_industries: null,
  placement_year: null
};

const sampleCourses: CourseRecord[] = [
  {
    ...baseCourse,
    university: 'Imperial College London',
    qs_uk_rank: 2,
    times_sunday_rank: 4,
    guardian_rank: 6,
    min_ib_score: 40,
    min_a_level_score: 'A*AA'
  },
  {
    ...baseCourse,
    university: 'University of Oxford',
    qs_uk_rank: 1,
    times_sunday_rank: 1,
    guardian_rank: 1,
    min_ib_score: 39,
    min_a_level_score: 'AAA'
  },
  {
    ...baseCourse,
    university: 'University of Warwick',
    qs_uk_rank: 15,
    times_sunday_rank: 10,
    guardian_rank: 12,
    min_ib_score: 36,
    min_a_level_score: 'AAB'
  },
  {
    ...baseCourse,
    university: 'University of Manchester',
    qs_uk_rank: 25,
    times_sunday_rank: 28,
    guardian_rank: 30,
    min_ib_score: 34,
    min_a_level_score: 'ABB'
  },
  {
    ...baseCourse,
    university: 'University of Bristol',
    qs_uk_rank: 30,
    times_sunday_rank: 26,
    guardian_rank: 40,
    min_ib_score: 32,
    min_a_level_score: 'BBB'
  },
  {
    ...baseCourse,
    university: 'University of Birmingham',
    qs_uk_rank: 45,
    times_sunday_rank: 38,
    guardian_rank: 55,
    min_ib_score: 30,
    min_a_level_score: 'BBC'
  },
  {
    ...baseCourse,
    university: 'University of Leeds',
    qs_uk_rank: 60,
    times_sunday_rank: 62,
    guardian_rank: 70,
    min_ib_score: 28,
    min_a_level_score: 'BCC'
  },
  {
    ...baseCourse,
    university: 'University of Sussex',
    qs_uk_rank: 78,
    times_sunday_rank: 85,
    guardian_rank: 90,
    min_ib_score: 27,
    min_a_level_score: 'CCC'
  },
  {
    ...baseCourse,
    university: 'University of Reading',
    qs_uk_rank: 95,
    times_sunday_rank: 105,
    guardian_rank: 120,
    min_ib_score: 26,
    min_a_level_score: 'CCD'
  },
  {
    ...baseCourse,
    university: 'Smaller Regional University',
    qs_uk_rank: 140,
    times_sunday_rank: 130,
    guardian_rank: 150,
    min_ib_score: null,
    min_a_level_score: null
  }
];

const enriched = enrichCourseRecords(sampleCourses);

console.log('University tiering demo');
enriched.forEach((course) => {
  console.log(
    `${course.university} • ${course.course} -> Tier ${course.course_tier} (total ${course.total_course_score})`
  );
});
