export type ProgrammeType = 'IB' | 'A_LEVEL';
export type IntendedCluster =
  | 'computer_science'
  | 'maths'
  | 'engineering'
  | 'life_sciences_biochem'
  | 'medicine_dentistry'
  | 'economics_quant'
  | 'business_non_quant'
  | 'law'
  | 'humanities'
  | 'creative';
export type EnglishTestType = 'IELTS' | 'TOEFL' | 'DUOLINGO' | 'WAIVER' | 'NONE';
export type EnglishStatus = 'met' | 'exceeds' | 'exceptional' | 'booked' | 'missing' | 'failed';
export type AdmissionsTestType = 'LNAT' | 'UCAT' | 'TMUA' | 'MAT' | 'STEP' | 'ESAT' | 'TSA' | 'NONE';
export type AdmissionsStatus = 'taken' | 'booked' | 'missing';

export type StudentSubject = {
  subject_name: string;
  level: 'HL' | 'SL' | 'A_LEVEL';
  grade_value: number | string | null;
};

export type StudentAdmissionsTest = {
  test_type: AdmissionsTestType;
  status: AdmissionsStatus;
  score_numeric: number | null;
  percentile: number | null;
};

export type StudentProfilePayload = {
  personal_information: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    nationality: string;
    age: number | null;
    gender: 'female' | 'male' | 'non_binary' | 'prefer_not_to_say' | null;
    resident_country: string;
    current_location_city: string | null;
    time_zone: string | null;
  };
  academic_input: {
    programme_type: ProgrammeType;
    school_name: string;
    school_country: string;
    school_city: string | null;
    school_type: 'international_school' | 'local_private' | 'state_public' | 'boarding' | 'other' | null;
    language_of_instruction: 'english' | 'bilingual' | 'non_english' | null;
    graduation_year: number;
    desired_start_date: string | null;
    intended_clusters: IntendedCluster[];
    secondary_clusters: IntendedCluster[];
    career_aspiration: string | null;
    subject_list: StudentSubject[];
    ib_total_points: number | null;
    ib_core_points: number | null;
    ib_tok_grade: 'A' | 'B' | 'C' | 'D' | 'E' | null;
    ib_ee_grade: 'A' | 'B' | 'C' | 'D' | 'E' | null;
    ib_math_pathway: 'AA_HL' | 'AA_SL' | 'AI_HL' | 'AI_SL' | null;
    ee_subject: string | null;
    ee_title: string | null;
    ee_summary: string | null;
    a_level_predicted_grades: Record<string, 'A*' | 'A' | 'B' | 'C' | 'D' | 'E' | 'U'> | null;
    english_required: boolean | null;
    english_test_type: EnglishTestType;
    english_status: EnglishStatus;
    english_score_overall: number | null;
    admissions_tests: StudentAdmissionsTest[];
  };
  lifestyle_preference: {
    teaching_style: 'academic' | 'practical' | 'mixed' | null;
    desired_location_type: 'london' | 'major_city' | 'smaller_city' | 'suburban' | 'no_preference' | null;
    campus_size: 'small' | 'medium' | 'large' | 'no_preference' | null;
    extracurricular_interests: string[];
    other_extracurriculars: string | null;
    // Activities & ambitions (step 4)
    leadership_roles: string[];
    commitment_level: string | null;
    key_activities: string[];
    sat_score: number | null;
    act_score: number | null;
    intl_experience: string[];
    work_experience: boolean | null;
    work_experience_summary: string | null;
    ambition_statement: string | null;
  };
};
