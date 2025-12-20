import type {
  AdmissionsTestType,
  IntendedCluster,
  ProgrammeType,
  StudentAdmissionsTest,
  StudentProfilePayload,
  StudentSubject
} from '@/lib/profile/intake-types';

type SubjectRule = {
  subject: string;
  substitutes?: string[];
};

type RequiredSubjectsRule = {
  required: SubjectRule[];
};

export type ScoreBreakdown = {
  eligibility: {
    required_subjects_met: Record<IntendedCluster, boolean>;
  };
  preferred_subjects_alignment: number;
  rigour_score: number;
  key_subject_grades: number;
  academic_performance: number;
  ib_hl_strength: number;
  ee_relevance_bonus: number;
  tests_and_english: number;
  total_score: number;
  student_band: StudentBand;
};

export type StudentBand = 'Exceptional' | 'Very strong' | 'Strong' | 'Solid' | 'Borderline' | 'Weak';

export type StudentScoreResult = {
  total_score: number;
  student_band: StudentBand;
  breakdown: ScoreBreakdown;
  eligibility_flags: string[];
  readiness_flags: string[];
};

const normalizeSubject = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\s+/g, ' ');

const SUBJECT_ALIASES: Record<string, string> = {
  maths: 'mathematics',
  math: 'mathematics',
  'further maths': 'further mathematics',
  'english lit': 'english literature',
  'english language': 'english language',
  'computer science': 'computer science',
  'design technology': 'design technology',
  'government and politics': 'government and politics'
};

const canonicalSubject = (value: string) => {
  const normalized = normalizeSubject(value);
  return SUBJECT_ALIASES[normalized] ?? normalized;
};

const mapSubjectSet = (subjects: StudentSubject[]) =>
  new Set(subjects.map((subject) => canonicalSubject(subject.subject_name)));

export const RequiredSubjectsRules: Record<IntendedCluster, RequiredSubjectsRule> = {
  computer_science: {
    required: [
      { subject: 'mathematics', substitutes: ['further mathematics'] }
    ]
  },
  maths: {
    required: [{ subject: 'mathematics' }]
  },
  engineering: {
    required: [
      { subject: 'mathematics', substitutes: ['further mathematics'] },
      { subject: 'physics' }
    ]
  },
  life_sciences_biochem: {
    required: [
      { subject: 'biology' },
      { subject: 'chemistry' }
    ]
  },
  medicine_dentistry: {
    required: [
      { subject: 'biology' },
      { subject: 'chemistry' }
    ]
  },
  economics_quant: {
    required: [{ subject: 'mathematics', substitutes: ['further mathematics'] }]
  },
  business_non_quant: {
    required: []
  },
  law: {
    required: [{ subject: 'english literature', substitutes: ['history', 'government and politics'] }]
  },
  humanities: {
    required: [{ subject: 'history', substitutes: ['english literature', 'geography'] }]
  },
  creative: {
    required: [{ subject: 'art and design', substitutes: ['design technology'] }]
  }
};

export const PreferredSubjectsRules: Record<IntendedCluster, { preferred: SubjectRule[] }> = {
  computer_science: {
    preferred: [
      { subject: 'mathematics', substitutes: ['further mathematics'] },
      { subject: 'computer science', substitutes: ['physics'] },
      { subject: 'further mathematics', substitutes: ['economics'] }
    ]
  },
  maths: {
    preferred: [
      { subject: 'mathematics' },
      { subject: 'further mathematics', substitutes: ['physics'] }
    ]
  },
  engineering: {
    preferred: [
      { subject: 'mathematics', substitutes: ['further mathematics'] },
      { subject: 'physics', substitutes: ['chemistry'] },
      { subject: 'design technology', substitutes: ['computer science'] }
    ]
  },
  life_sciences_biochem: {
    preferred: [
      { subject: 'biology' },
      { subject: 'chemistry' },
      { subject: 'mathematics', substitutes: ['physics'] }
    ]
  },
  medicine_dentistry: {
    preferred: [
      { subject: 'biology' },
      { subject: 'chemistry' },
      { subject: 'mathematics', substitutes: ['physics'] }
    ]
  },
  economics_quant: {
    preferred: [
      { subject: 'mathematics', substitutes: ['further mathematics'] },
      { subject: 'economics', substitutes: ['business'] }
    ]
  },
  business_non_quant: {
    preferred: [
      { subject: 'business', substitutes: ['economics'] },
      { subject: 'mathematics', substitutes: ['accounting'] }
    ]
  },
  law: {
    preferred: [
      { subject: 'english literature', substitutes: ['history'] },
      { subject: 'government and politics', substitutes: ['history'] }
    ]
  },
  humanities: {
    preferred: [
      { subject: 'history' },
      { subject: 'english literature', substitutes: ['philosophy'] },
      { subject: 'geography', substitutes: ['sociology'] }
    ]
  },
  creative: {
    preferred: [
      { subject: 'art and design' },
      { subject: 'design technology', substitutes: ['media studies'] }
    ]
  }
};

export const KeySubjectsRules: Record<IntendedCluster, string[]> = {
  computer_science: ['mathematics', 'computer science'],
  maths: ['mathematics', 'further mathematics'],
  engineering: ['mathematics', 'physics'],
  life_sciences_biochem: ['biology', 'chemistry'],
  medicine_dentistry: ['biology', 'chemistry'],
  economics_quant: ['mathematics', 'economics'],
  business_non_quant: ['business', 'economics'],
  law: ['english literature', 'history'],
  humanities: ['history', 'english literature'],
  creative: ['art and design', 'design technology']
};

export const RigourTable: Record<ProgrammeType, Record<string, 'HIGH' | 'MEDIUM' | 'LOW'>> = {
  IB: {
    mathematics: 'HIGH',
    'further mathematics': 'HIGH',
    physics: 'HIGH',
    chemistry: 'HIGH',
    biology: 'MEDIUM',
    'computer science': 'MEDIUM',
    economics: 'MEDIUM',
    history: 'MEDIUM',
    'english literature': 'MEDIUM',
    geography: 'MEDIUM',
    business: 'LOW',
    'art and design': 'LOW'
  },
  A_LEVEL: {
    mathematics: 'HIGH',
    'further mathematics': 'HIGH',
    physics: 'HIGH',
    chemistry: 'HIGH',
    biology: 'MEDIUM',
    'computer science': 'MEDIUM',
    economics: 'MEDIUM',
    history: 'MEDIUM',
    'english literature': 'MEDIUM',
    geography: 'MEDIUM',
    business: 'LOW',
    'art and design': 'LOW'
  }
};

const EE_RELEVANCE_RULES: Record<IntendedCluster, { direct: string[]; related: string[] }> = {
  computer_science: {
    direct: ['computer', 'computing', 'software', 'programming', 'ai', 'machine learning', 'data'],
    related: ['maths', 'mathematics', 'physics', 'engineering']
  },
  maths: {
    direct: ['maths', 'mathematics', 'algebra', 'calculus', 'statistics'],
    related: ['physics', 'economics']
  },
  engineering: {
    direct: ['engineering', 'mechanical', 'electrical', 'civil', 'design'],
    related: ['physics', 'mathematics', 'materials']
  },
  life_sciences_biochem: {
    direct: ['biology', 'biochem', 'biochemistry', 'genetics', 'molecular'],
    related: ['chemistry', 'medicine']
  },
  medicine_dentistry: {
    direct: ['medicine', 'medical', 'dentistry', 'clinical', 'anatomy'],
    related: ['biology', 'chemistry']
  },
  economics_quant: {
    direct: ['economics', 'finance', 'markets', 'econometrics'],
    related: ['mathematics', 'statistics']
  },
  business_non_quant: {
    direct: ['business', 'management', 'marketing', 'entrepreneur'],
    related: ['economics']
  },
  law: {
    direct: ['law', 'legal', 'justice', 'criminal', 'constitutional'],
    related: ['history', 'politics']
  },
  humanities: {
    direct: ['history', 'philosophy', 'literature', 'culture'],
    related: ['politics', 'sociology']
  },
  creative: {
    direct: ['art', 'design', 'music', 'creative', 'media'],
    related: ['architecture', 'theatre']
  }
};

const ADMISSIONS_TEST_REQUIREMENTS: Record<IntendedCluster, AdmissionsTestType[]> = {
  law: ['LNAT'],
  medicine_dentistry: ['UCAT'],
  computer_science: [],
  maths: [],
  engineering: [],
  life_sciences_biochem: [],
  economics_quant: ['TMUA'],
  business_non_quant: [],
  humanities: [],
  creative: []
};

const GRADE_POINTS_IB: Record<number, number> = {
  7: 5,
  6: 4,
  5: 3,
  4: 2
};

const GRADE_POINTS_ALEVEL: Record<string, number> = {
  'A*': 5,
  A: 4,
  B: 3,
  C: 2,
  D: 1,
  E: 1,
  U: 0
};

const RIGOUR_POINTS: Record<'HIGH' | 'MEDIUM' | 'LOW', number> = {
  HIGH: 5,
  MEDIUM: 3,
  LOW: 1
};

const mapAlevelGradeToRank = (grade: string) => {
  const order = ['U', 'E', 'D', 'C', 'B', 'A', 'A*'];
  const index = order.indexOf(grade);
  return index === -1 ? 0 : index + 1;
};

const calculateEligibility = (subjects: StudentSubject[], clusters: IntendedCluster[]) => {
  const subjectSet = mapSubjectSet(subjects);
  const requiredMet: Record<IntendedCluster, boolean> = {} as Record<IntendedCluster, boolean>;
  const eligibilityFlags: string[] = [];

  clusters.forEach((cluster) => {
    const rule = RequiredSubjectsRules[cluster];
    if (!rule || rule.required.length === 0) {
      requiredMet[cluster] = true;
      return;
    }

    const clusterMet = rule.required.every((required) => {
      const canonical = canonicalSubject(required.subject);
      if (subjectSet.has(canonical)) return true;
      const substitutes = (required.substitutes ?? []).map(canonicalSubject);
      return substitutes.some((sub) => subjectSet.has(sub));
    });

    requiredMet[cluster] = clusterMet;
    if (!clusterMet) {
      eligibilityFlags.push(`required_subjects_missing:${cluster}`);
    }
  });

  return { requiredMet, eligibilityFlags };
};

const calculatePreferredAlignment = (subjects: StudentSubject[], clusters: IntendedCluster[]) => {
  const subjectSet = mapSubjectSet(subjects);
  const clusterScores = clusters.map((cluster) => {
    const rule = PreferredSubjectsRules[cluster];
    if (!rule) return 0;
    const points = rule.preferred.map((item) => {
      const canonical = canonicalSubject(item.subject);
      if (subjectSet.has(canonical)) return 5;
      const substitutes = (item.substitutes ?? []).map(canonicalSubject);
      return substitutes.some((sub) => subjectSet.has(sub)) ? 3 : 0;
    });
    if (points.length === 0) return 0;
    const average = points.reduce<number>((sum, value) => sum + value, 0) / points.length;
    return average * 4;
  });
  return clusterScores.length ? Math.max(...clusterScores) : 0;
};

const calculateRigourScore = (programmeType: ProgrammeType, subjects: StudentSubject[]) => {
  const rigourMap = RigourTable[programmeType];
  const relevantSubjects =
    programmeType === 'IB'
      ? subjects.filter((subject) => subject.level === 'HL')
      : subjects.filter((subject) => subject.level === 'A_LEVEL');
  if (relevantSubjects.length === 0) return 0;

  const subjectPoints = relevantSubjects
    .map((subject) => {
      const key = canonicalSubject(subject.subject_name);
      const rigour = rigourMap[key] ?? 'MEDIUM';
      return RIGOUR_POINTS[rigour];
    })
    .sort((a, b) => b - a);

  const slice = subjectPoints.slice(0, 3);
  const average = slice.reduce((sum, value) => sum + value, 0) / slice.length;
  return average * 3;
};

const calculateKeySubjectGrades = (
  programmeType: ProgrammeType,
  subjects: StudentSubject[],
  clusters: IntendedCluster[]
) => {
  const subjectMap = new Map(subjects.map((subject) => [canonicalSubject(subject.subject_name), subject.grade_value]));
  const clusterScores = clusters.map((cluster) => {
    const keySubjects = KeySubjectsRules[cluster] ?? [];
    const points = keySubjects
      .map((subjectName) => {
        const grade = subjectMap.get(canonicalSubject(subjectName));
        if (grade === null || grade === undefined) return null;
        if (programmeType === 'IB') {
          const numeric = typeof grade === 'number' ? grade : Number(grade);
          return GRADE_POINTS_IB[numeric] ?? 0;
        }
        const stringGrade = String(grade).toUpperCase();
        return GRADE_POINTS_ALEVEL[stringGrade] ?? 0;
      })
      .filter((value): value is number => value !== null);
    if (!points.length) return 0;
    const average = points.reduce((sum, value) => sum + value, 0) / points.length;
    return average * 2;
  });
  return clusterScores.length ? Math.max(...clusterScores) : 0;
};

const calculateIbTotalScore = (totalPoints: number | null) => {
  if (!totalPoints) return 0;
  if (totalPoints <= 24) return 0;
  if (totalPoints <= 27) return 10;
  if (totalPoints <= 29) return 20;
  if (totalPoints <= 31) return 32;
  if (totalPoints <= 33) return 42;
  if (totalPoints <= 35) return 52;
  if (totalPoints <= 37) return 60;
  if (totalPoints <= 39) return 68;
  if (totalPoints <= 41) return 74;
  if (totalPoints <= 43) return 78;
  return 80;
};

const calculateALevelProfileScore = (grades: Record<string, string> | null) => {
  if (!grades) return 0;
  const gradeValues = Object.values(grades).filter(Boolean);
  if (gradeValues.length < 3) return 0;
  const sorted = gradeValues
    .map((grade) => grade.toUpperCase())
    .sort((a, b) => mapAlevelGradeToRank(b) - mapAlevelGradeToRank(a))
    .slice(0, 3);
  const signature = sorted.join('');
  if (signature === 'A*A*A*' || signature === 'A*A*A') return 80;
  if (signature === 'A*AA') return 76;
  if (signature === 'AAA') return 70;
  if (signature === 'AAB') return 60;
  if (signature === 'ABB') return 52;
  if (signature === 'ABC') return 46;
  if (signature === 'BBB') return 44;
  if (signature === 'BBC') return 36;
  if (signature === 'BCC') return 30;
  if (signature === 'CCC') return 24;
  if (signature === 'CCD') return 16;
  if (signature === 'DDD') return 10;
  if (signature === 'EEE' || signature === 'DEE') return 5;

  const rankValues = sorted.map(mapAlevelGradeToRank);
  const allBelowC = rankValues.every((rank) => rank <= mapAlevelGradeToRank('D'));
  if (allBelowC) return 8;
  return 8;
};

const calculateIbHlStrength = (subjects: StudentSubject[]) => {
  const hlScores = subjects
    .filter((subject) => subject.level === 'HL')
    .map((subject) => (typeof subject.grade_value === 'number' ? subject.grade_value : Number(subject.grade_value)))
    .filter((value) => Number.isFinite(value))
    .map((value) => {
      if (value >= 7) return 20;
      if (value === 6) return 16;
      if (value === 5) return 12;
      if (value === 4) return 6;
      return 0;
    })
    .sort((a, b) => b - a)
    .slice(0, 3);
  if (!hlScores.length) return 0;
  const sum = hlScores.reduce<number>((total, value) => total + value, 0);
  return (sum / 60) * 40;
};

const calculateEeRelevance = (cluster: IntendedCluster | null, payload: StudentProfilePayload) => {
  if (!cluster) return 0;
  const rule = EE_RELEVANCE_RULES[cluster];
  if (!rule) return 0;
  const content = [payload.academic_input.ee_subject, payload.academic_input.ee_title, payload.academic_input.ee_summary]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (!content) return 0;
  const hasDirect = rule.direct.some((keyword) => content.includes(keyword));
  if (hasDirect) return 10;
  const hasRelated = rule.related.some((keyword) => content.includes(keyword));
  return hasRelated ? 5 : 0;
};

const calculateTestsAndEnglish = (
  clusters: IntendedCluster[],
  admissionsTests: StudentAdmissionsTest[],
  englishRequired: boolean | null,
  englishStatus: string,
  englishTestType: string,
  englishScore: number | null
) => {
  const readinessFlags: string[] = [];
  const eligibilityFlags: string[] = [];

  if (englishRequired === true && ['missing', 'failed'].includes(englishStatus)) {
    readinessFlags.push('english_test_missing');
  }

  const requiredTests = new Set(
    clusters.flatMap((cluster) => ADMISSIONS_TEST_REQUIREMENTS[cluster] ?? [])
  );
  requiredTests.forEach((testType) => {
    const test = admissionsTests.find((entry) => entry.test_type === testType);
    if (!test || test.status === 'missing') {
      eligibilityFlags.push(`admissions_test_missing:${testType}`);
    }
  });

  const testScores: number[] = [];
  const lnat = admissionsTests.find((test) => test.test_type === 'LNAT');
  if (lnat?.score_numeric !== null && lnat?.score_numeric !== undefined) {
    const score = lnat.score_numeric;
    if (score <= 19) testScores.push(0);
    else if (score <= 22) testScores.push(4);
    else if (score <= 25) testScores.push(8);
    else if (score <= 28) testScores.push(12);
    else if (score <= 31) testScores.push(16);
    else testScores.push(20);
  }

  const ucat = admissionsTests.find((test) => test.test_type === 'UCAT');
  if (ucat?.percentile !== null && ucat?.percentile !== undefined) {
    const percentile = ucat.percentile;
    if (percentile < 50) testScores.push(0);
    else if (percentile < 70) testScores.push(8);
    else if (percentile < 80) testScores.push(12);
    else if (percentile < 90) testScores.push(16);
    else testScores.push(20);
  }

  if (englishRequired !== false) {
    if (englishStatus === 'met') {
      testScores.push(12);
    } else if (englishStatus === 'exceeds') {
      testScores.push(16);
    } else if (englishStatus === 'exceptional') {
      testScores.push(18);
    } else if (englishTestType === 'IELTS' && typeof englishScore === 'number') {
      if (englishScore >= 8) testScores.push(18);
      else if (englishScore >= 7.5) testScores.push(16);
      else if (englishScore >= 6.5) testScores.push(12);
    }
  }

  const score = testScores.length ? Math.max(...testScores) : 0;

  return { score, readinessFlags, eligibilityFlags };
};

const mapBand = (score: number): StudentBand => {
  if (score >= 170) return 'Exceptional';
  if (score >= 150) return 'Very strong';
  if (score >= 130) return 'Strong';
  if (score >= 110) return 'Solid';
  if (score >= 90) return 'Borderline';
  return 'Weak';
};

export const scoreStudentProfile = (payload: StudentProfilePayload): StudentScoreResult => {
  const { academic_input } = payload;
  const programmeType = academic_input.programme_type;
  const subjects = academic_input.subject_list;
  const clusters = academic_input.intended_clusters;

  const eligibility = calculateEligibility(subjects, clusters);
  const preferredAlignment = calculatePreferredAlignment(subjects, clusters);
  const rigourScore = calculateRigourScore(programmeType, subjects);
  const keySubjectGrades = calculateKeySubjectGrades(programmeType, subjects, clusters);
  const academicPerformance =
    programmeType === 'IB'
      ? calculateIbTotalScore(academic_input.ib_total_points)
      : calculateALevelProfileScore(academic_input.a_level_predicted_grades);
  const ibHlStrength = programmeType === 'IB' ? calculateIbHlStrength(subjects) : 0;
  const eeRelevanceBonus =
    programmeType === 'IB' && clusters.length > 0 ? calculateEeRelevance(clusters[0], payload) : 0;

  const testsAndEnglish = calculateTestsAndEnglish(
    clusters,
    academic_input.admissions_tests,
    academic_input.english_required,
    academic_input.english_status,
    academic_input.english_test_type,
    academic_input.english_score_overall
  );

  const totalRaw =
    preferredAlignment +
    rigourScore +
    keySubjectGrades +
    academicPerformance +
    ibHlStrength +
    eeRelevanceBonus +
    testsAndEnglish.score;
  const totalScore = Math.min(200, Math.round(totalRaw));
  const band = mapBand(totalScore);

  const breakdown: ScoreBreakdown = {
    eligibility: {
      required_subjects_met: eligibility.requiredMet
    },
    preferred_subjects_alignment: Math.round(preferredAlignment),
    rigour_score: Math.round(rigourScore),
    key_subject_grades: Math.round(keySubjectGrades),
    academic_performance: Math.round(academicPerformance),
    ib_hl_strength: Math.round(ibHlStrength),
    ee_relevance_bonus: Math.round(eeRelevanceBonus),
    tests_and_english: Math.round(testsAndEnglish.score),
    total_score: totalScore,
    student_band: band
  };

  return {
    total_score: totalScore,
    student_band: band,
    breakdown,
    eligibility_flags: [...eligibility.eligibilityFlags, ...testsAndEnglish.eligibilityFlags],
    readiness_flags: testsAndEnglish.readinessFlags
  };
};
