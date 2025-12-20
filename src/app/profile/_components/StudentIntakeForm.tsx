'use client';

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type {
  AdmissionsStatus,
  AdmissionsTestType,
  EnglishStatus,
  EnglishTestType,
  IntendedCluster,
  ProgrammeType,
  StudentAdmissionsTest,
  StudentProfilePayload,
  StudentSubject
} from '@/lib/profile/intake-types';
import { saveStudentIntake } from '../actions';

type SubjectRowState = {
  subject_name: string;
  level: 'HL' | 'SL' | 'A_LEVEL';
  grade_value: string;
};

type AdmissionsRowState = {
  test_type: AdmissionsTestType;
  status: AdmissionsStatus | '';
  score_numeric: string;
  percentile: string;
};

type EnglishRequiredState = 'yes' | 'no' | 'not_sure' | '';

const CLUSTER_OPTIONS: { value: IntendedCluster; label: string }[] = [
  { value: 'computer_science', label: 'Computer science' },
  { value: 'maths', label: 'Mathematics' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'life_sciences_biochem', label: 'Life sciences & biochem' },
  { value: 'medicine_dentistry', label: 'Medicine & dentistry' },
  { value: 'economics_quant', label: 'Economics (quant)' },
  { value: 'business_non_quant', label: 'Business (non-quant)' },
  { value: 'law', label: 'Law' },
  { value: 'humanities', label: 'Humanities' },
  { value: 'creative', label: 'Creative' }
];

const COUNTRY_OPTIONS = [
  'United Kingdom',
  'United States',
  'Canada',
  'Australia',
  'Ireland',
  'India',
  'China',
  'Singapore',
  'Hong Kong',
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Kuwait',
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Netherlands',
  'Sweden',
  'Norway',
  'Denmark',
  'Poland',
  'Pakistan',
  'Bangladesh',
  'Malaysia',
  'Indonesia',
  'Vietnam',
  'Philippines',
  'Japan',
  'South Korea',
  'Turkey',
  'Brazil',
  'Mexico',
  'Chile',
  'Argentina',
  'Other'
];

const SCHOOL_TYPE_OPTIONS = [
  { value: 'international_school', label: 'International school' },
  { value: 'local_private', label: 'Local private' },
  { value: 'state_public', label: 'State/public' },
  { value: 'boarding', label: 'Boarding' },
  { value: 'other', label: 'Other' }
];

const SUBJECT_OPTIONS = [
  'Mathematics',
  'Further Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Economics',
  'Business',
  'Accounting',
  'Psychology',
  'English Literature',
  'English Language',
  'History',
  'Geography',
  'Government & Politics',
  'Philosophy',
  'Sociology',
  'Art & Design',
  'Design Technology',
  'Music',
  'Theatre Studies',
  'Media Studies',
  'Modern Languages',
  'Classical Studies',
  'Sports Science',
  'Environmental Systems',
  'Other'
];

const ENGLISH_TEST_OPTIONS: { value: EnglishTestType; label: string }[] = [
  { value: 'IELTS', label: 'IELTS' },
  { value: 'TOEFL', label: 'TOEFL' },
  { value: 'DUOLINGO', label: 'Duolingo' },
  { value: 'WAIVER', label: 'Waiver' },
  { value: 'NONE', label: 'None' }
];

const ENGLISH_STATUS_OPTIONS: { value: EnglishStatus; label: string }[] = [
  { value: 'booked', label: 'Booked' },
  { value: 'met', label: 'Met' },
  { value: 'exceeds', label: 'Exceeds' },
  { value: 'exceptional', label: 'Exceptional' },
  { value: 'missing', label: 'Missing' },
  { value: 'failed', label: 'Failed' }
];

const ADMISSIONS_TEST_OPTIONS: { value: AdmissionsTestType; label: string }[] = [
  { value: 'LNAT', label: 'LNAT' },
  { value: 'UCAT', label: 'UCAT' },
  { value: 'TMUA', label: 'TMUA' },
  { value: 'MAT', label: 'MAT' },
  { value: 'STEP', label: 'STEP' },
  { value: 'ESAT', label: 'ESAT' },
  { value: 'TSA', label: 'TSA' },
  { value: 'NONE', label: 'None' }
];

const EXTRACURRICULAR_OPTIONS = [
  'Sports/fitness',
  'Student societies',
  'Volunteering',
  'Entrepreneurship',
  'Arts/music',
  'Debate/public speaking',
  'Gaming/esports',
  'Cultural clubs',
  'Other'
];

const GRADUATION_YEARS = (() => {
  const current = new Date().getFullYear();
  return [current - 2, current - 1, current, current + 1, current + 2, current + 3, current + 4, current + 5];
})();

const IB_GRADES = ['A', 'B', 'C', 'D', 'E'] as const;
const A_LEVEL_GRADES = ['A*', 'A', 'B', 'C', 'D', 'E', 'U'] as const;

const buildEmptySubject = (programmeType: ProgrammeType | ''): SubjectRowState => ({
  subject_name: '',
  level: programmeType === 'IB' ? 'HL' : 'A_LEVEL',
  grade_value: ''
});

const buildDefaultSubjects = (programmeType: ProgrammeType | ''): SubjectRowState[] => {
  if (programmeType === 'IB') {
    return Array.from({ length: 6 }, (_, index) => ({
      subject_name: '',
      level: index < 3 ? 'HL' : 'SL',
      grade_value: ''
    }));
  }
  return Array.from({ length: 6 }, () => buildEmptySubject('A_LEVEL'));
};

const clusterLabelMap = new Map(CLUSTER_OPTIONS.map((option) => [option.value, option.label]));

export const StudentIntakeForm = ({
  initialStep = 1,
  initialPayload = null
}: {
  initialStep?: number;
  initialPayload?: StudentProfilePayload | null;
}) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [programmeType, setProgrammeType] = useState<ProgrammeType | ''>('');
  const [nationalities, setNationalities] = useState<string[]>(['']);
  const [subjects, setSubjects] = useState<SubjectRowState[]>(buildDefaultSubjects(''));
  const [admissionsTests, setAdmissionsTests] = useState<AdmissionsRowState[]>([]);
  const [englishRequired, setEnglishRequired] = useState<EnglishRequiredState>('');
  const [englishTestType, setEnglishTestType] = useState<EnglishTestType>('NONE');
  const [englishStatus, setEnglishStatus] = useState<EnglishStatus>('missing');
  const [englishScoreOverall, setEnglishScoreOverall] = useState('');
  const hasHydratedRef = useRef(false);
  const skipProgrammeResetRef = useRef(false);

  const [personalInfo, setPersonalInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
    age: '',
    gender: '',
    resident_country: '',
    current_location_city: '',
    time_zone:
      typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function'
        ? Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''
        : ''
  });

  const [academicInput, setAcademicInput] = useState({
    school_name: '',
    school_country: '',
    school_city: '',
    school_type: '',
    graduation_year: '',
    desired_start_date: '',
    intended_clusters: [] as IntendedCluster[],
    secondary_clusters: [] as IntendedCluster[],
    career_aspiration: '',
    ib_total_points: '',
    ib_core_points: '',
    ib_tok_grade: '',
    ib_ee_grade: '',
    ib_math_pathway: '',
    ee_subject: '',
    ee_title: '',
    ee_summary: ''
  });

  const [lifestylePreference, setLifestylePreference] = useState({
    teaching_style: '',
    desired_location_type: '',
    campus_size: '',
    extracurricular_interests: [] as string[],
    other_extracurriculars: ''
  });

  const applyPayload = useCallback((payload: StudentProfilePayload) => {
    const { personal_information, academic_input, lifestyle_preference } = payload;
    skipProgrammeResetRef.current = true;
    setProgrammeType(academic_input.programme_type ?? '');
    setPersonalInfo({
      first_name: personal_information.first_name ?? '',
      last_name: personal_information.last_name ?? '',
      email: personal_information.email ?? '',
      age: personal_information.age !== null && personal_information.age !== undefined ? String(personal_information.age) : '',
      gender: personal_information.gender ?? '',
      resident_country: personal_information.resident_country ?? '',
      current_location_city: personal_information.current_location_city ?? '',
      time_zone: personal_information.time_zone ?? ''
    });
    setNationalities(
      personal_information.nationality
        ? personal_information.nationality
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        : ['']
    );
    setAcademicInput({
      school_name: academic_input.school_name ?? '',
      school_country: academic_input.school_country ?? '',
      school_city: academic_input.school_city ?? '',
      school_type: academic_input.school_type ?? '',
      graduation_year: academic_input.graduation_year ? String(academic_input.graduation_year) : '',
      desired_start_date: academic_input.desired_start_date ?? '',
      intended_clusters: academic_input.intended_clusters ?? [],
      secondary_clusters: academic_input.secondary_clusters ?? [],
      career_aspiration: academic_input.career_aspiration ?? '',
      ib_total_points: academic_input.ib_total_points !== null && academic_input.ib_total_points !== undefined ? String(academic_input.ib_total_points) : '',
      ib_core_points: academic_input.ib_core_points !== null && academic_input.ib_core_points !== undefined ? String(academic_input.ib_core_points) : '',
      ib_tok_grade: academic_input.ib_tok_grade ?? '',
      ib_ee_grade: academic_input.ib_ee_grade ?? '',
      ib_math_pathway: academic_input.ib_math_pathway ?? '',
      ee_subject: academic_input.ee_subject ?? '',
      ee_title: academic_input.ee_title ?? '',
      ee_summary: academic_input.ee_summary ?? ''
    });
    setSubjects(() => {
      const base = academic_input.subject_list ?? [];
      const mapped = base.slice(0, 6).map((subject) => ({
        subject_name: subject.subject_name ?? '',
        level: subject.level ?? (academic_input.programme_type === 'IB' ? 'HL' : 'A_LEVEL'),
        grade_value:
          typeof subject.grade_value === 'number'
            ? String(subject.grade_value)
            : subject.grade_value ?? ''
      }));
      while (mapped.length < 6) {
        mapped.push(buildEmptySubject(academic_input.programme_type ?? ''));
      }
      return mapped;
    });
    setAdmissionsTests(
      (academic_input.admissions_tests ?? []).map((test) => ({
        test_type: test.test_type,
        status: test.status,
        score_numeric: test.score_numeric !== null && test.score_numeric !== undefined ? String(test.score_numeric) : '',
        percentile: test.percentile !== null && test.percentile !== undefined ? String(test.percentile) : ''
      }))
    );
    setEnglishRequired(
      academic_input.english_required === true ? 'yes' : academic_input.english_required === false ? 'no' : 'not_sure'
    );
    setEnglishTestType(academic_input.english_test_type ?? 'NONE');
    setEnglishStatus(academic_input.english_status ?? 'missing');
    setEnglishScoreOverall(
      academic_input.english_score_overall !== null && academic_input.english_score_overall !== undefined
        ? String(academic_input.english_score_overall)
        : ''
    );
    setLifestylePreference({
      teaching_style: lifestyle_preference.teaching_style ?? '',
      desired_location_type: lifestyle_preference.desired_location_type ?? '',
      campus_size: lifestyle_preference.campus_size ?? '',
      extracurricular_interests: lifestyle_preference.extracurricular_interests ?? [],
      other_extracurriculars: lifestyle_preference.other_extracurriculars ?? ''
    });
  }, []);

  useEffect(() => {
    if (!programmeType) return;
    if (skipProgrammeResetRef.current) {
      skipProgrammeResetRef.current = false;
      return;
    }
    setSubjects(buildDefaultSubjects(programmeType));
    if (programmeType === 'A_LEVEL') {
      setAcademicInput((prev) => ({
        ...prev,
        ib_math_pathway: '',
        ib_total_points: '',
        ib_core_points: '',
        ib_tok_grade: '',
        ib_ee_grade: '',
        ee_subject: '',
        ee_title: '',
        ee_summary: ''
      }));
    }
  }, [programmeType]);

  useEffect(() => {
    if (!initialPayload || hasHydratedRef.current) return;
    hasHydratedRef.current = true;
    applyPayload(initialPayload);
  }, [applyPayload, initialPayload]);

  useEffect(() => {
    if (englishRequired === 'no') {
      setEnglishTestType('WAIVER');
      setEnglishStatus('met');
      setEnglishScoreOverall('');
      return;
    }
    if (englishRequired === 'yes' || englishRequired === 'not_sure') {
      if (englishTestType === 'WAIVER') {
        setEnglishTestType('NONE');
      }
    }
  }, [englishRequired, englishTestType]);

  useEffect(() => {
    const wantsLaw = academicInput.intended_clusters.includes('law');
    const wantsMedicine = academicInput.intended_clusters.includes('medicine_dentistry');
    const alreadyNone = admissionsTests.some((test) => test.test_type === 'NONE');
    if (alreadyNone) return;

    setAdmissionsTests((prev) => {
      const next = [...prev];
      if (wantsLaw && !next.some((test) => test.test_type === 'LNAT')) {
        next.push({ test_type: 'LNAT', status: '', score_numeric: '', percentile: '' });
      }
      if (wantsMedicine && !next.some((test) => test.test_type === 'UCAT')) {
        next.push({ test_type: 'UCAT', status: '', score_numeric: '', percentile: '' });
      }
      return next;
    });
  }, [academicInput.intended_clusters, admissionsTests]);

  const showEnglishScore =
    englishRequired !== 'no' && (englishTestType === 'IELTS' || englishTestType === 'TOEFL' || englishTestType === 'DUOLINGO');

  const showAdmissionsTests =
    academicInput.intended_clusters.some((cluster) =>
      ['law', 'medicine_dentistry', 'maths', 'engineering', 'computer_science', 'economics_quant'].includes(cluster)
    ) || admissionsTests.length > 0;

  const updatePersonalInfo = (key: keyof typeof personalInfo, value: string) => {
    setPersonalInfo((prev) => ({ ...prev, [key]: value }));
  };

  const updateAcademicInput = (key: keyof typeof academicInput, value: string) => {
    setAcademicInput((prev) => ({ ...prev, [key]: value }));
  };

  const updateLifestylePreference = (key: keyof typeof lifestylePreference, value: string | string[]) => {
    setLifestylePreference((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCluster = (value: IntendedCluster, target: 'intended_clusters' | 'secondary_clusters') => {
    setAcademicInput((prev) => {
      if (target === 'intended_clusters') {
        return { ...prev, intended_clusters: prev.intended_clusters.includes(value) ? [] : [value] };
      }
      const current = new Set(prev.secondary_clusters);
      if (current.has(value)) {
        current.delete(value);
        return { ...prev, secondary_clusters: Array.from(current) };
      }
      if (current.size >= 2) {
        return prev;
      }
      current.add(value);
      return { ...prev, secondary_clusters: Array.from(current) };
    });
  };

  const toggleExtracurricular = (value: string) => {
    setLifestylePreference((prev) => {
      const current = new Set(prev.extracurricular_interests);
      if (current.has(value)) {
        current.delete(value);
      } else {
        current.add(value);
      }
      return { ...prev, extracurricular_interests: Array.from(current) };
    });
  };

  const updateSubject = (index: number, key: keyof SubjectRowState, value: string) => {
    setSubjects((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const addSubject = () => {
    setSubjects((prev) => (prev.length >= 6 ? prev : [...prev, buildEmptySubject(programmeType)]));
  };

  const removeSubject = (index: number) => {
    setSubjects((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  };

  const toggleAdmissionsTest = (testType: AdmissionsTestType) => {
    setAdmissionsTests((prev) => {
      if (testType === 'NONE') {
        return [{ test_type: 'NONE', status: 'missing', score_numeric: '', percentile: '' }];
      }
      const withoutNone = prev.filter((test) => test.test_type !== 'NONE');
      const exists = withoutNone.some((test) => test.test_type === testType);
      if (exists) {
        return withoutNone.filter((test) => test.test_type !== testType);
      }
      return [...withoutNone, { test_type: testType, status: '', score_numeric: '', percentile: '' }];
    });
  };

  const updateAdmissionsTest = (index: number, key: keyof AdmissionsRowState, value: string) => {
    setAdmissionsTests((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const addNationality = () => {
    setNationalities((prev) => [...prev, '']);
  };

  const updateNationality = (index: number, value: string) => {
    setNationalities((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const removeNationality = (index: number) => {
    setNationalities((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  };

  const parseNumber = (value: string) => {
    if (!value.trim()) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const formattedNationalities = useMemo(
    () => nationalities.map((item) => item.trim()).filter(Boolean),
    [nationalities]
  );

  const buildPayload = (): StudentProfilePayload => {
    const subjectList: StudentSubject[] = subjects.map((subject) => ({
      subject_name: subject.subject_name.trim(),
      level: subject.level,
      grade_value:
        programmeType === 'IB'
          ? parseNumber(subject.grade_value)
          : subject.grade_value.trim()
            ? subject.grade_value.trim()
            : null
    }));

    const aLevelPredicted =
      programmeType === 'A_LEVEL'
        ? Object.fromEntries(
          subjectList
            .filter((subject) => typeof subject.grade_value === 'string' && subject.subject_name)
            .map((subject) => [subject.subject_name, subject.grade_value as 'A*' | 'A' | 'B' | 'C' | 'D' | 'E' | 'U'])
        )
        : null;

    const admissionsPayload: StudentAdmissionsTest[] = admissionsTests
      .filter((test) => test.test_type !== 'NONE')
      .map((test) => ({
        test_type: test.test_type,
        status: (test.status || 'missing') as AdmissionsStatus,
        score_numeric: parseNumber(test.score_numeric),
        percentile: parseNumber(test.percentile)
      }));

    return {
      personal_information: {
        first_name: personalInfo.first_name.trim(),
        last_name: personalInfo.last_name.trim(),
        email: personalInfo.email.trim(),
        phone: null,
        nationality: formattedNationalities.join(', '),
        age: parseNumber(personalInfo.age),
        gender: personalInfo.gender ? (personalInfo.gender as StudentProfilePayload['personal_information']['gender']) : null,
        resident_country: personalInfo.resident_country.trim(),
        current_location_city: personalInfo.current_location_city.trim() || null,
        time_zone: personalInfo.time_zone.trim() || null
      },
      academic_input: {
        programme_type: programmeType as ProgrammeType,
        school_name: academicInput.school_name.trim(),
        school_country: academicInput.school_country.trim(),
        school_city: academicInput.school_city.trim() || null,
        school_type: academicInput.school_type
          ? (academicInput.school_type as StudentProfilePayload['academic_input']['school_type'])
          : null,
        language_of_instruction: null,
        graduation_year: Number(academicInput.graduation_year),
        desired_start_date: academicInput.desired_start_date || null,
        intended_clusters: academicInput.intended_clusters,
        secondary_clusters: academicInput.secondary_clusters,
        career_aspiration: academicInput.career_aspiration.trim() || null,
        subject_list: subjectList,
        ib_total_points: programmeType === 'IB' ? parseNumber(academicInput.ib_total_points) : null,
        ib_core_points: programmeType === 'IB' ? parseNumber(academicInput.ib_core_points) : null,
        ib_tok_grade: programmeType === 'IB' && academicInput.ib_tok_grade
          ? (academicInput.ib_tok_grade as StudentProfilePayload['academic_input']['ib_tok_grade'])
          : null,
        ib_ee_grade: programmeType === 'IB' && academicInput.ib_ee_grade
          ? (academicInput.ib_ee_grade as StudentProfilePayload['academic_input']['ib_ee_grade'])
          : null,
        ib_math_pathway: programmeType === 'IB' && academicInput.ib_math_pathway
          ? (academicInput.ib_math_pathway as StudentProfilePayload['academic_input']['ib_math_pathway'])
          : null,
        ee_subject: programmeType === 'IB' ? academicInput.ee_subject.trim() || null : null,
        ee_title: programmeType === 'IB' ? academicInput.ee_title.trim() || null : null,
        ee_summary: programmeType === 'IB' ? academicInput.ee_summary.trim() || null : null,
        a_level_predicted_grades: aLevelPredicted,
        english_required: englishRequired === 'yes' ? true : englishRequired === 'no' ? false : null,
        english_test_type: englishTestType,
        english_status: englishStatus,
        english_score_overall: showEnglishScore ? parseNumber(englishScoreOverall) : null,
        admissions_tests: admissionsPayload
      },
      lifestyle_preference: {
        teaching_style: lifestylePreference.teaching_style
          ? (lifestylePreference.teaching_style as StudentProfilePayload['lifestyle_preference']['teaching_style'])
          : null,
        desired_location_type: lifestylePreference.desired_location_type
          ? (lifestylePreference.desired_location_type as StudentProfilePayload['lifestyle_preference']['desired_location_type'])
          : null,
        campus_size: lifestylePreference.campus_size
          ? (lifestylePreference.campus_size as StudentProfilePayload['lifestyle_preference']['campus_size'])
          : null,
        extracurricular_interests: lifestylePreference.extracurricular_interests,
        other_extracurriculars: lifestylePreference.other_extracurriculars.trim() || null
      }
    };
  };

  const validateStep1 = () => {
    const nextErrors: Record<string, string> = {};
    if (!personalInfo.first_name.trim()) nextErrors['personal_information.first_name'] = 'First name is required.';
    if (!personalInfo.last_name.trim()) nextErrors['personal_information.last_name'] = 'Last name is required.';
    if (!personalInfo.email.trim()) {
      nextErrors['personal_information.email'] = 'Email is required.';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(personalInfo.email.trim())) {
      nextErrors['personal_information.email'] = 'Enter a valid email address.';
    }
    if (!formattedNationalities.length) nextErrors['personal_information.nationality'] = 'Add at least one nationality.';
    if (!personalInfo.resident_country.trim()) nextErrors['personal_information.resident_country'] = 'Country of residence is required.';
    return nextErrors;
  };

  const validateStep2 = () => {
    const nextErrors: Record<string, string> = {};
    if (!programmeType) nextErrors['academic_input.programme_type'] = 'Select IB or A-levels.';
    if (!academicInput.school_name.trim()) nextErrors['academic_input.school_name'] = 'School name is required.';
    if (!academicInput.school_country.trim()) nextErrors['academic_input.school_country'] = 'School country is required.';
    if (!academicInput.graduation_year) nextErrors['academic_input.graduation_year'] = 'Graduation year is required.';
    if (!academicInput.intended_clusters.length) nextErrors['academic_input.intended_clusters'] = 'Select at least one subject cluster.';
    return nextErrors;
  };

  const validateSubjects = (nextErrors: Record<string, string>) => {
    const filledSubjects = subjects.filter((subject) => subject.subject_name.trim());
    if (programmeType === 'IB') {
      if (filledSubjects.length !== 6) {
        nextErrors['academic_input.subject_list'] = 'IB requires exactly 6 subjects.';
      }
      const hlCount = filledSubjects.filter((subject) => subject.level === 'HL').length;
      if (hlCount !== 3) {
        nextErrors['academic_input.subject_list.hl'] = 'IB requires 3 Higher Level subjects.';
      }
    }
    if (programmeType === 'A_LEVEL') {
      if (filledSubjects.length < 3) {
        nextErrors['academic_input.subject_list'] = 'A-levels require at least 3 subjects.';
      }
      if (filledSubjects.length > 6) {
        nextErrors['academic_input.subject_list'] = 'A-levels are limited to 6 subjects.';
      }
    }

    subjects.forEach((subject, index) => {
      if (!subject.subject_name.trim()) {
        nextErrors[`academic_input.subject_list.${index}.subject_name`] = 'Subject is required.';
      }
      if (!subject.grade_value.trim()) {
        nextErrors[`academic_input.subject_list.${index}.grade_value`] = 'Grade is required.';
      } else if (programmeType === 'IB') {
        const gradeValue = parseNumber(subject.grade_value);
        if (gradeValue === null || gradeValue < 1 || gradeValue > 7) {
          nextErrors[`academic_input.subject_list.${index}.grade_value`] = 'Enter a grade between 1 and 7.';
        }
      }
    });
  };

  const validateStep3 = () => {
    const nextErrors: Record<string, string> = {};
    validateSubjects(nextErrors);
    if (programmeType === 'IB') {
      if (!academicInput.ib_math_pathway) nextErrors['academic_input.ib_math_pathway'] = 'Maths pathway is required.';
      const totalPoints = parseNumber(academicInput.ib_total_points);
      if (totalPoints === null) {
        nextErrors['academic_input.ib_total_points'] = 'Predicted total points are required.';
      } else if (totalPoints < 24 || totalPoints > 45) {
        nextErrors['academic_input.ib_total_points'] = 'Enter a total between 24 and 45.';
      }
      const corePoints = parseNumber(academicInput.ib_core_points);
      if (corePoints !== null && (corePoints < 0 || corePoints > 3)) {
        nextErrors['academic_input.ib_core_points'] = 'Core points must be between 0 and 3.';
      }
      if (academicInput.ee_summary && academicInput.ee_summary.length > 350) {
        nextErrors['academic_input.ee_summary'] = 'Summary should be under 350 characters.';
      }
    }

    if (!englishRequired) {
      nextErrors['academic_input.english_required'] = 'Select an option.';
    }
    if (englishRequired !== 'no') {
      if (!englishTestType) nextErrors['academic_input.english_test_type'] = 'Select a test type.';
      if (!englishStatus) nextErrors['academic_input.english_status'] = 'Select a test status.';
    }
    admissionsTests.forEach((test, index) => {
      if (test.test_type === 'NONE') return;
      if (!test.status) {
        nextErrors[`academic_input.admissions_tests.${index}.status`] = 'Select a status.';
      }
    });

    return nextErrors;
  };

  const validateStep4 = () => {
    return {} as Record<string, string>;
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return validateStep1();
      case 2:
        return validateStep2();
      case 3:
        return validateStep3();
      case 4:
        return validateStep4();
      case 5:
        return {};
      default:
        return {};
    }
  };

  const goNext = () => {
    const nextErrors = validateCurrentStep();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setCurrentStep((prev) => Math.min(5, prev + 1));
  };

  const goToStep = (targetStep: number) => {
    if (targetStep === currentStep) return;
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }
    const nextErrors = validateCurrentStep();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setCurrentStep(Math.min(5, Math.max(1, targetStep)));
  };

  const restoreSavedProfile = () => {
    if (!initialPayload) return;
    setErrors({});
    setCurrentStep(1);
    setStatusMessage('Restored your last submission.');
    applyPayload(initialPayload);
  };

  const goBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const step1Errors = validateStep1();
    const step2Errors = validateStep2();
    const step3Errors = validateStep3();
    const step4Errors = validateStep4();
    const nextErrors = { ...step1Errors, ...step2Errors, ...step3Errors, ...step4Errors };
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      if (Object.keys(step1Errors).length > 0) {
        setCurrentStep(1);
      } else if (Object.keys(step2Errors).length > 0) {
        setCurrentStep(2);
      } else if (Object.keys(step3Errors).length > 0) {
        setCurrentStep(3);
      } else {
        setCurrentStep(4);
      }
      return;
    }
    const payload = buildPayload();
    setStatusMessage('Saving profile...');
    console.log('Student intake payload', payload);
    startTransition(async () => {
      try {
        const result = await saveStudentIntake(payload);
        if (!result?.success) {
          setStatusMessage(result?.message ?? 'Save failed.');
          return;
        }
        router.push('/matches');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Save failed.';
        setStatusMessage(message);
      }
    });
  };

  const progressLabel = `Step ${currentStep} of 5`;
  const englishRequiredLabel =
    englishRequired === 'yes'
      ? 'Yes'
      : englishRequired === 'no'
        ? 'No'
        : englishRequired === 'not_sure'
          ? 'Not sure'
          : '';

  return (
    <form className="intake-form" onSubmit={handleSubmit}>
      <div className="intake-layout">
        <aside className="intake-sidebar">
          <div className="sidebar-card">
            <p className="step-indicator">{progressLabel}</p>
            <h3 className="sidebar-title">Navigation</h3>
            <p className="muted">Jump to any section of your profile.</p>
            <div className="step-nav">
              {[
                { step: 1, label: 'Personal' },
                { step: 2, label: 'Academic input' },
                { step: 3, label: 'Academics' },
                { step: 4, label: 'Lifestyle' },
                { step: 5, label: 'Review' }
              ].map((item) => (
                <button
                  key={item.step}
                  type="button"
                  className={item.step === currentStep ? 'step-chip active' : 'step-chip'}
                  onClick={() => goToStep(item.step)}
                >
                  {item.step}. {item.label}
                </button>
              ))}
              {initialPayload ? (
                <button type="button" className="step-chip ghost" onClick={restoreSavedProfile}>
                  Load last submission
                </button>
              ) : null}
            </div>
          </div>
        </aside>

        <div className="intake-main">
          <header className="intake-header">
            <div>
              <p className="step-indicator">{progressLabel}</p>
              <h2>Student profile wizard</h2>
              <p className="muted">Fast, focused questions so we can tailor UK admissions guidance.</p>
            </div>
            <div className="progress-pill">{progressLabel}</div>
          </header>

          {currentStep === 1 ? (
            <section className="intake-section">
              <h3>Personal information</h3>
          <div className="grid two">
            <label className="field">
              <span>First name</span>
              <input
                type="text"
                value={personalInfo.first_name}
                onChange={(event) => updatePersonalInfo('first_name', event.target.value)}
              />
              {errors['personal_information.first_name'] ? <em>{errors['personal_information.first_name']}</em> : null}
            </label>
            <label className="field">
              <span>Last name</span>
              <input
                type="text"
                value={personalInfo.last_name}
                onChange={(event) => updatePersonalInfo('last_name', event.target.value)}
              />
              {errors['personal_information.last_name'] ? <em>{errors['personal_information.last_name']}</em> : null}
            </label>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={personalInfo.email}
                onChange={(event) => updatePersonalInfo('email', event.target.value)}
              />
              {errors['personal_information.email'] ? <em>{errors['personal_information.email']}</em> : null}
            </label>
          </div>

          <div className="field-group">
            <div className="field-group-header">
              <div>
                <span className="label">Nationality</span>
                <p className="helper">Add more than one if needed.</p>
              </div>
              <button type="button" className="link-button" onClick={addNationality}>
                Add another
              </button>
            </div>
            {nationalities.map((value, index) => (
              <div key={`nationality-${index}`} className="row">
                <input
                  list="country-options"
                  value={value}
                  onChange={(event) => updateNationality(index, event.target.value)}
                  placeholder="Select nationality"
                />
                {nationalities.length > 1 ? (
                  <button type="button" className="link-button" onClick={() => removeNationality(index)}>
                    Remove
                  </button>
                ) : null}
              </div>
            ))}
            {errors['personal_information.nationality'] ? <em>{errors['personal_information.nationality']}</em> : null}
          </div>

          <div className="grid two">
            <label className="field">
              <span>Age (optional)</span>
              <input
                type="number"
                min={10}
                max={60}
                value={personalInfo.age}
                onChange={(event) => updatePersonalInfo('age', event.target.value)}
              />
            </label>
            <div className="field">
              <span>Gender (optional)</span>
              <div className="inline-options">
                {[
                  { value: 'female', label: 'Female' },
                  { value: 'male', label: 'Male' },
                  { value: 'non_binary', label: 'Non-binary' },
                  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                ].map((option) => (
                  <label key={option.value} className="radio">
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={personalInfo.gender === option.value}
                      onChange={(event) => updatePersonalInfo('gender', event.target.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
            <label className="field">
              <span>Country of residence</span>
              <input
                list="country-options"
                value={personalInfo.resident_country}
                onChange={(event) => updatePersonalInfo('resident_country', event.target.value)}
              />
              {errors['personal_information.resident_country'] ? (
                <em>{errors['personal_information.resident_country']}</em>
              ) : null}
            </label>
            <label className="field">
              <span>Current city (optional)</span>
              <input
                type="text"
                value={personalInfo.current_location_city}
                onChange={(event) => updatePersonalInfo('current_location_city', event.target.value)}
              />
            </label>
          </div>
        </section>
      ) : null}

          {currentStep === 2 ? (
            <section className="intake-section">
              <h3>Academic input</h3>
          <div className="field">
            <span>Which qualification are you taking?</span>
            <div className="inline-options">
              {[
                { value: 'IB', label: 'IB Diploma' },
                { value: 'A_LEVEL', label: 'A-levels' }
              ].map((option) => (
                <label key={option.value} className="radio">
                  <input
                    type="radio"
                    name="programme_type"
                    value={option.value}
                    checked={programmeType === option.value}
                    onChange={(event) => setProgrammeType(event.target.value as ProgrammeType)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {errors['academic_input.programme_type'] ? <em>{errors['academic_input.programme_type']}</em> : null}
          </div>

          <div className="grid two">
            <label className="field">
              <span>School name</span>
              <input
                type="text"
                value={academicInput.school_name}
                onChange={(event) => updateAcademicInput('school_name', event.target.value)}
              />
              {errors['academic_input.school_name'] ? <em>{errors['academic_input.school_name']}</em> : null}
            </label>
            <label className="field">
              <span>School country</span>
              <input
                list="country-options"
                value={academicInput.school_country}
                onChange={(event) => updateAcademicInput('school_country', event.target.value)}
              />
              {errors['academic_input.school_country'] ? <em>{errors['academic_input.school_country']}</em> : null}
            </label>
            <label className="field">
              <span>School city (optional)</span>
              <input
                type="text"
                value={academicInput.school_city}
                onChange={(event) => updateAcademicInput('school_city', event.target.value)}
              />
            </label>
            <label className="field">
              <span>School type (optional)</span>
              <select
                value={academicInput.school_type}
                onChange={(event) => updateAcademicInput('school_type', event.target.value)}
              >
                <option value="">Select</option>
                {SCHOOL_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid two">
            <label className="field">
              <span>Graduation year</span>
              <select
                value={academicInput.graduation_year}
                onChange={(event) => updateAcademicInput('graduation_year', event.target.value)}
              >
                <option value="">Select</option>
                {GRADUATION_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors['academic_input.graduation_year'] ? <em>{errors['academic_input.graduation_year']}</em> : null}
            </label>
            <label className="field">
              <span>Desired UK start date (optional)</span>
              <input
                type="date"
                value={academicInput.desired_start_date}
                onChange={(event) => updateAcademicInput('desired_start_date', event.target.value)}
              />
            </label>
          </div>

          <div className="field-group">
            <div className="field-group-header">
              <div>
                <span className="label">What do you want to study?</span>
                <p className="helper">Select one primary focus.</p>
              </div>
              <span className="tooltip" title="We use this to shortlist the most relevant programmes.">
                Why we ask this
              </span>
            </div>
            <div className="checkbox-grid">
              {CLUSTER_OPTIONS.map((option) => (
                <label key={option.value} className="checkbox">
                  <input
                    type="checkbox"
                    checked={academicInput.intended_clusters.includes(option.value)}
                    disabled={
                      !academicInput.intended_clusters.includes(option.value) &&
                      academicInput.intended_clusters.length >= 1
                    }
                    onChange={() => toggleCluster(option.value, 'intended_clusters')}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {errors['academic_input.intended_clusters'] ? <em>{errors['academic_input.intended_clusters']}</em> : null}
          </div>

          <div className="field-group">
            <div className="field-group-header">
              <div>
                <span className="label">Any secondary interests? (optional)</span>
                <p className="helper">Choose up to two.</p>
              </div>
            </div>
            <div className="checkbox-grid">
              {CLUSTER_OPTIONS.map((option) => (
                <label key={`secondary-${option.value}`} className="checkbox">
                  <input
                    type="checkbox"
                    checked={academicInput.secondary_clusters.includes(option.value)}
                    disabled={
                      !academicInput.secondary_clusters.includes(option.value) &&
                      academicInput.secondary_clusters.length >= 2
                    }
                    onChange={() => toggleCluster(option.value, 'secondary_clusters')}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <label className="field">
            <span>Career aspiration (optional)</span>
            <input
              type="text"
              placeholder="Investment banking, Software engineer"
              value={academicInput.career_aspiration}
              onChange={(event) => updateAcademicInput('career_aspiration', event.target.value)}
            />
          </label>
        </section>
      ) : null}

          {currentStep === 3 ? (
            <section className="intake-section">
              <h3>Academic details</h3>

          <div className="field-group">
            <div className="field-group-header">
              <div>
                <span className="label">Your subjects and predicted grades</span>
                <p className="helper">IB requires exactly 6 subjects with 3 HL.</p>
              </div>
              <button type="button" className="link-button" onClick={addSubject}>
                Add subject
              </button>
            </div>

            <div className="subject-grid">
              {subjects.map((subject, index) => (
                <div key={`subject-${index}`} className="subject-row">
                  <div>
                    <label>
                      Subject
                      <input
                        list="subject-options"
                        value={subject.subject_name}
                        onChange={(event) => updateSubject(index, 'subject_name', event.target.value)}
                      />
                    </label>
                    {errors[`academic_input.subject_list.${index}.subject_name`] ? (
                      <em>{errors[`academic_input.subject_list.${index}.subject_name`]}</em>
                    ) : null}
                  </div>
                  <div>
                    <label>
                      Level
                      <select
                        value={subject.level}
                        onChange={(event) => updateSubject(index, 'level', event.target.value)}
                        disabled={programmeType === 'A_LEVEL'}
                      >
                        {programmeType === 'IB' ? (
                          <>
                            <option value="HL">HL</option>
                            <option value="SL">SL</option>
                          </>
                        ) : (
                          <option value="A_LEVEL">A-level</option>
                        )}
                      </select>
                    </label>
                  </div>
                  <div>
                    <label>
                      Predicted grade
                      {programmeType === 'IB' ? (
                        <input
                          type="number"
                          min={1}
                          max={7}
                          value={subject.grade_value}
                          onChange={(event) => updateSubject(index, 'grade_value', event.target.value)}
                        />
                      ) : (
                        <select
                          value={subject.grade_value}
                          onChange={(event) => updateSubject(index, 'grade_value', event.target.value)}
                        >
                          <option value="">Select</option>
                          {A_LEVEL_GRADES.map((grade) => (
                            <option key={grade} value={grade}>
                              {grade}
                            </option>
                          ))}
                        </select>
                      )}
                    </label>
                    {errors[`academic_input.subject_list.${index}.grade_value`] ? (
                      <em>{errors[`academic_input.subject_list.${index}.grade_value`]}</em>
                    ) : null}
                  </div>
                  <div className="subject-actions">
                    <button type="button" className="link-button" onClick={() => removeSubject(index)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {errors['academic_input.subject_list'] ? <em>{errors['academic_input.subject_list']}</em> : null}
            {errors['academic_input.subject_list.hl'] ? <em>{errors['academic_input.subject_list.hl']}</em> : null}
          </div>

          {programmeType === 'IB' ? (
            <>
              <div className="field">
                <span>Maths pathway</span>
                <div className="inline-options">
                  {[
                    { value: 'AA_HL', label: 'AA HL' },
                    { value: 'AA_SL', label: 'AA SL' },
                    { value: 'AI_HL', label: 'AI HL' },
                    { value: 'AI_SL', label: 'AI SL' }
                  ].map((option) => (
                    <label key={option.value} className="radio">
                      <input
                        type="radio"
                        name="ib_math_pathway"
                        value={option.value}
                        checked={academicInput.ib_math_pathway === option.value}
                        onChange={(event) => updateAcademicInput('ib_math_pathway', event.target.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {errors['academic_input.ib_math_pathway'] ? <em>{errors['academic_input.ib_math_pathway']}</em> : null}
              </div>

              <div className="grid two">
                <label className="field">
                  <span>Predicted total IB points</span>
                  <input
                    type="number"
                    min={24}
                    max={45}
                    value={academicInput.ib_total_points}
                    onChange={(event) => updateAcademicInput('ib_total_points', event.target.value)}
                  />
                  {errors['academic_input.ib_total_points'] ? <em>{errors['academic_input.ib_total_points']}</em> : null}
                </label>
                <label className="field">
                  <span>Core points (optional)</span>
                  <input
                    type="number"
                    min={0}
                    max={3}
                    value={academicInput.ib_core_points}
                    onChange={(event) => updateAcademicInput('ib_core_points', event.target.value)}
                  />
                  {errors['academic_input.ib_core_points'] ? <em>{errors['academic_input.ib_core_points']}</em> : null}
                </label>
                <label className="field">
                  <span>TOK grade (optional)</span>
                  <select
                    value={academicInput.ib_tok_grade}
                    onChange={(event) => updateAcademicInput('ib_tok_grade', event.target.value)}
                  >
                    <option value="">Select</option>
                    {IB_GRADES.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>EE grade (optional)</span>
                  <select
                    value={academicInput.ib_ee_grade}
                    onChange={(event) => updateAcademicInput('ib_ee_grade', event.target.value)}
                  >
                    <option value="">Select</option>
                    {IB_GRADES.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid two">
                <label className="field">
                  <span>Extended Essay subject (optional)</span>
                  <input
                    type="text"
                    value={academicInput.ee_subject}
                    onChange={(event) => updateAcademicInput('ee_subject', event.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Extended Essay title (optional)</span>
                  <input
                    type="text"
                    value={academicInput.ee_title}
                    onChange={(event) => updateAcademicInput('ee_title', event.target.value)}
                  />
                </label>
              </div>
              <label className="field">
                <span>Extended Essay summary (optional)</span>
                <textarea
                  rows={3}
                  maxLength={350}
                  value={academicInput.ee_summary}
                  onChange={(event) => updateAcademicInput('ee_summary', event.target.value)}
                  placeholder="1–3 sentences max"
                />
                {errors['academic_input.ee_summary'] ? <em>{errors['academic_input.ee_summary']}</em> : null}
              </label>
            </>
          ) : null}

          <div className="field-group">
            <div className="field-group-header">
              <div>
                <span className="label">English proficiency</span>
                <p className="helper">Some universities require a formal test score.</p>
              </div>
              <span className="tooltip" title="We use this to flag whether a language test is still needed.">
                Why we ask this
              </span>
            </div>
            <div className="field">
              <span>Will you need to prove English proficiency?</span>
              <div className="inline-options">
                {[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                  { value: 'not_sure', label: 'Not sure' }
                ].map((option) => (
                  <label key={option.value} className="radio">
                    <input
                      type="radio"
                      name="english_required"
                      value={option.value}
                      checked={englishRequired === option.value}
                      onChange={(event) => setEnglishRequired(event.target.value as EnglishRequiredState)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              {errors['academic_input.english_required'] ? <em>{errors['academic_input.english_required']}</em> : null}
            </div>

            {englishRequired !== 'no' ? (
              <div className="grid two">
                <label className="field">
                  <span>English test type</span>
                  <select value={englishTestType} onChange={(event) => setEnglishTestType(event.target.value as EnglishTestType)}>
                    {ENGLISH_TEST_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors['academic_input.english_test_type'] ? <em>{errors['academic_input.english_test_type']}</em> : null}
                </label>
                <div className="field">
                  <span>English test status</span>
                  <div className="inline-options">
                    {ENGLISH_STATUS_OPTIONS.map((option) => (
                      <label key={option.value} className="radio">
                        <input
                          type="radio"
                          name="english_status"
                          value={option.value}
                          checked={englishStatus === option.value}
                          onChange={(event) => setEnglishStatus(event.target.value as EnglishStatus)}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                  {errors['academic_input.english_status'] ? <em>{errors['academic_input.english_status']}</em> : null}
                </div>
              </div>
            ) : null}

            {showEnglishScore ? (
              <label className="field">
                <span>English overall score (optional)</span>
                <input
                  type="number"
                  value={englishScoreOverall}
                  onChange={(event) => setEnglishScoreOverall(event.target.value)}
                />
              </label>
            ) : null}
          </div>

          {showAdmissionsTests ? (
            <div className="field-group">
              <div className="field-group-header">
                <div>
                  <span className="label">Admissions tests</span>
                  <p className="helper">Select the tests you have taken or booked.</p>
                </div>
                <span className="tooltip" title="Some subjects require admissions tests for eligibility.">
                  Why we ask this
                </span>
              </div>
              <div className="checkbox-grid">
                {ADMISSIONS_TEST_OPTIONS.map((option) => (
                  <label key={option.value} className="checkbox">
                    <input
                      type="checkbox"
                      checked={admissionsTests.some((test) => test.test_type === option.value)}
                      onChange={() => toggleAdmissionsTest(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>

              {admissionsTests.filter((test) => test.test_type !== 'NONE').map((test, index) => (
                <div key={`${test.test_type}-${index}`} className="subject-row">
                  <div>
                    <label>
                      Test
                      <input type="text" value={test.test_type} disabled />
                    </label>
                  </div>
                  <div>
                    <label>
                      Status
                      <div className="inline-options">
                        {[
                          { value: 'taken', label: 'Taken' },
                          { value: 'booked', label: 'Booked' },
                          { value: 'missing', label: 'Missing' }
                        ].map((option) => (
                          <label key={`${test.test_type}-${option.value}`} className="radio">
                            <input
                              type="radio"
                              name={`admissions-status-${index}`}
                              value={option.value}
                              checked={test.status === option.value}
                              onChange={(event) => updateAdmissionsTest(index, 'status', event.target.value)}
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>
                    </label>
                    {errors[`academic_input.admissions_tests.${index}.status`] ? (
                      <em>{errors[`academic_input.admissions_tests.${index}.status`]}</em>
                    ) : null}
                  </div>
                  <div>
                    <label>
                      Score (optional)
                      <input
                        type="number"
                        value={test.score_numeric}
                        onChange={(event) => updateAdmissionsTest(index, 'score_numeric', event.target.value)}
                      />
                    </label>
                  </div>
                  <div>
                    <label>
                      Percentile (optional)
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={test.percentile}
                        onChange={(event) => updateAdmissionsTest(index, 'percentile', event.target.value)}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {currentStep === 4 ? (
        <section className="intake-section">
          <h3>Lifestyle preferences</h3>
          <div className="field">
            <span>Teaching style preference</span>
            <div className="inline-options">
              {[
                { value: 'academic', label: 'Academic' },
                { value: 'practical', label: 'Practical' },
                { value: 'mixed', label: 'Mixed' },
                { value: '', label: 'No preference' }
              ].map((option) => (
                <label key={option.value} className="radio">
                  <input
                    type="radio"
                    name="teaching_style"
                    value={option.value}
                    checked={lifestylePreference.teaching_style === option.value}
                    onChange={(event) => updateLifestylePreference('teaching_style', event.target.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
          <div className="field">
            <span>Preferred location type</span>
            <div className="inline-options">
              {[
                { value: 'london', label: 'London' },
                { value: 'major_city', label: 'Major city' },
                { value: 'smaller_city', label: 'Smaller city' },
                { value: 'suburban', label: 'Suburban' },
                { value: 'no_preference', label: 'No preference' }
              ].map((option) => (
                <label key={option.value} className="radio">
                  <input
                    type="radio"
                    name="desired_location_type"
                    value={option.value}
                    checked={lifestylePreference.desired_location_type === option.value}
                    onChange={(event) => updateLifestylePreference('desired_location_type', event.target.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
          <div className="field">
            <span>Campus size preference</span>
            <div className="inline-options">
              {[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' },
                { value: 'no_preference', label: 'No preference' }
              ].map((option) => (
                <label key={option.value} className="radio">
                  <input
                    type="radio"
                    name="campus_size"
                    value={option.value}
                    checked={lifestylePreference.campus_size === option.value}
                    onChange={(event) => updateLifestylePreference('campus_size', event.target.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
          <div className="field-group">
            <div className="field-group-header">
              <div>
                <span className="label">Extracurricular interests</span>
                <p className="helper">Select any that matter to your university experience.</p>
              </div>
            </div>
            <div className="checkbox-grid">
              {EXTRACURRICULAR_OPTIONS.map((option) => (
                <label key={option} className="checkbox">
                  <input
                    type="checkbox"
                    checked={lifestylePreference.extracurricular_interests.includes(option)}
                    onChange={() => toggleExtracurricular(option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          <label className="field">
            <span>Other extracurriculars (optional)</span>
            <input
              type="text"
              value={lifestylePreference.other_extracurriculars}
              onChange={(event) => updateLifestylePreference('other_extracurriculars', event.target.value)}
            />
          </label>
        </section>
      ) : null}

      {currentStep === 5 ? (
        <section className="intake-section review-step">
          <h3>Review & submit</h3>
          <p className="muted">Check everything below before submitting your profile.</p>
          <div className="review-panel">
            <div className="review-grid">
              <div>
                <span className="label">Name</span>
                <p>{personalInfo.first_name || '—'} {personalInfo.last_name || ''}</p>
              </div>
              <div>
                <span className="label">Email</span>
                <p>{personalInfo.email || '—'}</p>
              </div>
              <div>
                <span className="label">Nationality</span>
                <p>{formattedNationalities.join(', ') || '—'}</p>
              </div>
              <div>
                <span className="label">Age</span>
                <p>{personalInfo.age || '—'}</p>
              </div>
              <div>
                <span className="label">Gender</span>
                <p>{personalInfo.gender || '—'}</p>
              </div>
              <div>
                <span className="label">Residence</span>
                <p>{personalInfo.resident_country || '—'}</p>
              </div>
              <div>
                <span className="label">Current city</span>
                <p>{personalInfo.current_location_city || '—'}</p>
              </div>
              <div>
                <span className="label">Programme</span>
                <p>{programmeType || '—'}</p>
              </div>
              <div>
                <span className="label">School</span>
                <p>{academicInput.school_name || '—'}</p>
              </div>
              <div>
                <span className="label">School country</span>
                <p>{academicInput.school_country || '—'}</p>
              </div>
              <div>
                <span className="label">School city</span>
                <p>{academicInput.school_city || '—'}</p>
              </div>
              <div>
                <span className="label">School type</span>
                <p>{academicInput.school_type || '—'}</p>
              </div>
              <div>
                <span className="label">Graduation year</span>
                <p>{academicInput.graduation_year || '—'}</p>
              </div>
              <div>
                <span className="label">Start date</span>
                <p>{academicInput.desired_start_date || '—'}</p>
              </div>
              <div>
                <span className="label">Primary subject</span>
                <p>
                  {academicInput.intended_clusters.length
                    ? academicInput.intended_clusters.map((cluster) => clusterLabelMap.get(cluster)).join(', ')
                    : '—'}
                </p>
              </div>
              <div>
                <span className="label">Secondary interests</span>
                <p>
                  {academicInput.secondary_clusters.length
                    ? academicInput.secondary_clusters.map((cluster) => clusterLabelMap.get(cluster)).join(', ')
                    : '—'}
                </p>
              </div>
              <div>
                <span className="label">Career aspiration</span>
                <p>{academicInput.career_aspiration || '—'}</p>
              </div>
              <div>
                <span className="label">Subjects</span>
                <p>
                  {subjects
                    .filter((subject) => subject.subject_name.trim())
                    .map((subject) => `${subject.subject_name} (${subject.level}) ${subject.grade_value || ''}`.trim())
                    .join(', ') || '—'}
                </p>
              </div>
              {programmeType === 'IB' ? (
                <>
                  <div>
                    <span className="label">IB total points</span>
                    <p>{academicInput.ib_total_points || '—'}</p>
                  </div>
                  <div>
                    <span className="label">IB core points</span>
                    <p>{academicInput.ib_core_points || '—'}</p>
                  </div>
                  <div>
                    <span className="label">TOK grade</span>
                    <p>{academicInput.ib_tok_grade || '—'}</p>
                  </div>
                  <div>
                    <span className="label">EE grade</span>
                    <p>{academicInput.ib_ee_grade || '—'}</p>
                  </div>
                  <div>
                    <span className="label">Maths pathway</span>
                    <p>{academicInput.ib_math_pathway || '—'}</p>
                  </div>
                  <div>
                    <span className="label">EE subject</span>
                    <p>{academicInput.ee_subject || '—'}</p>
                  </div>
                  <div>
                    <span className="label">EE title</span>
                    <p>{academicInput.ee_title || '—'}</p>
                  </div>
                  <div>
                    <span className="label">EE summary</span>
                    <p>{academicInput.ee_summary || '—'}</p>
                  </div>
                </>
              ) : (
                <div>
                  <span className="label">A-level predicted grades</span>
                  <p>
                    {academicInput.a_level_predicted_grades
                      ? Object.entries(academicInput.a_level_predicted_grades)
                          .map(([subject, grade]) => `${subject}: ${grade}`)
                          .join(', ')
                      : '—'}
                  </p>
                </div>
              )}
              <div>
                <span className="label">English requirement</span>
                <p>{englishRequiredLabel || '—'}</p>
              </div>
              <div>
                <span className="label">English test</span>
                <p>{englishTestType || '—'} • {englishStatus || '—'}</p>
              </div>
              <div>
                <span className="label">Admissions tests</span>
                <p>
                  {admissionsTests.filter((test) => test.test_type !== 'NONE').length
                    ? admissionsTests
                        .filter((test) => test.test_type !== 'NONE')
                        .map((test) => `${test.test_type} (${test.status || 'missing'})`)
                        .join(', ')
                    : '—'}
                </p>
              </div>
              <div>
                <span className="label">Lifestyle</span>
                <p>
                  {[
                    lifestylePreference.teaching_style,
                    lifestylePreference.desired_location_type,
                    lifestylePreference.campus_size
                  ]
                    .filter(Boolean)
                    .join(' • ') || '—'}
                </p>
              </div>
              <div>
                <span className="label">Extracurriculars</span>
                <p>{lifestylePreference.extracurricular_interests.join(', ') || '—'}</p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <div className="button-row">
        <Button type="button" variant="outline" onClick={goBack} disabled={currentStep === 1}>
          Back
        </Button>
        {currentStep < 5 ? (
          <Button type="button" onClick={goNext}>
            Next
          </Button>
        ) : (
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Submit'}
              </Button>
            )}
          </div>

      {statusMessage ? <p className="status">{statusMessage}</p> : null}
        </div>
      </div>

      <datalist id="country-options">
        {COUNTRY_OPTIONS.map((country) => (
          <option key={country} value={country} />
        ))}
      </datalist>
      <datalist id="subject-options">
        {SUBJECT_OPTIONS.map((subject) => (
          <option key={subject} value={subject} />
        ))}
      </datalist>

      <style jsx>{`
        .intake-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 24px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(16px);
        }
        .intake-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .intake-sidebar {
          width: 100%;
        }
        .sidebar-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(7, 10, 24, 0.45);
        }
        .sidebar-title {
          margin: 0;
          font-size: 18px;
        }
        .intake-main {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .intake-header {
          display: flex;
          flex-direction: column;
          gap: 12px;
          justify-content: space-between;
        }
        .intake-header h2 {
          font-size: 28px;
          margin: 0;
        }
        .muted {
          margin: 4px 0 0;
          color: rgba(255, 255, 255, 0.6);
        }
        .step-indicator {
          text-transform: uppercase;
          letter-spacing: 0.25em;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
        }
        .progress-pill {
          align-self: flex-start;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          font-size: 12px;
        }
        .step-nav {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .step-chip {
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          padding: 6px 12px;
          font-size: 12px;
          background: rgba(255, 255, 255, 0.06);
          color: inherit;
          cursor: pointer;
          text-align: left;
          width: 100%;
        }
        .step-chip.active {
          background: rgba(99, 102, 241, 0.2);
          border-color: rgba(99, 102, 241, 0.45);
        }
        .step-chip.ghost {
          background: rgba(255, 255, 255, 0.12);
        }
        .intake-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .review-step {
          align-items: center;
          text-align: center;
        }
        .review-step .review-panel {
          width: min(100%, 920px);
          margin: 0 auto;
          text-align: left;
        }
        .intake-section h3 {
          margin: 0;
          font-size: 22px;
        }
        .grid.two {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field span {
          font-weight: 600;
        }
        input,
        select,
        textarea {
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          padding: 10px 12px;
          background: rgba(7, 10, 24, 0.5);
          color: inherit;
        }
        input:disabled,
        select:disabled {
          opacity: 0.7;
        }
        em {
          color: #ffb4a2;
          font-size: 12px;
          font-style: normal;
        }
        .inline-options {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .radio,
        .checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
        }
        .field-group-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .label {
          font-weight: 600;
        }
        .helper {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          margin: 4px 0 0;
        }
        .tooltip {
          font-size: 12px;
          text-decoration: underline;
          cursor: help;
          color: rgba(255, 255, 255, 0.7);
        }
        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 10px;
        }
        .subject-grid {
          display: grid;
          gap: 12px;
        }
        .subject-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          background: rgba(7, 10, 24, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .subject-actions {
          display: flex;
          align-items: flex-end;
        }
        .row {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .link-button {
          background: none;
          border: none;
          color: inherit;
          font-size: 12px;
          cursor: pointer;
          text-decoration: underline;
        }
        .button-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }
        .review-panel {
          border-radius: 16px;
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
        }
        .review-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }
        .status {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
        }
        .output {
          padding: 16px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(7, 10, 24, 0.45);
        }
        pre {
          white-space: pre-wrap;
          word-break: break-word;
          font-size: 12px;
        }
        @media (min-width: 768px) {
          .intake-header {
            flex-direction: row;
            align-items: center;
          }
        }
        @media (min-width: 1024px) {
          .intake-layout {
            flex-direction: row;
            align-items: flex-start;
          }
          .intake-sidebar {
            width: 260px;
            position: sticky;
            top: 24px;
          }
          .intake-main {
            flex: 1;
          }
        }
      `}</style>
    </form>
  );
};
