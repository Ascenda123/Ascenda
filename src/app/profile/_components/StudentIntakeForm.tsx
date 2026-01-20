'use client';

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, Globe, GraduationCap, User, Heart, Settings, Layout, Search, Sparkles, Send, GraduationCap as School, Moon, Sun, Pencil, Trash2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { PROFILE_STEPS } from '@/lib/profile/steps';
import { cn } from '@/lib/utils';
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
  const [isRedirecting, setIsRedirecting] = useState(false);
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

  useEffect(() => {
    if (typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        setPersonalInfo(prev => ({ ...prev, time_zone: tz }));
      }
    }
  }, []);

  const [personalInfo, setPersonalInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
    age: '',
    gender: '',
    resident_country: '',
    current_location_city: '',
    time_zone: ''
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

  const parseNumber = useCallback((value: string) => {
    if (!value.trim()) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }, []);

  const formattedNationalities = useMemo(
    () => nationalities.map((item) => item.trim()).filter(Boolean),
    [nationalities]
  );

  const buildPayload = useCallback((): StudentProfilePayload => {
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
  }, [
    subjects, programmeType, parseNumber, admissionsTests, personalInfo,
    formattedNationalities, academicInput, englishRequired, englishTestType,
    englishStatus, showEnglishScore, englishScoreOverall, lifestylePreference
  ]);

  const validateStep1 = useCallback(() => {
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
  }, [personalInfo.first_name, personalInfo.last_name, personalInfo.email, formattedNationalities, personalInfo.resident_country]);

  const validateStep2 = useCallback(() => {
    const nextErrors: Record<string, string> = {};
    if (!programmeType) nextErrors['academic_input.programme_type'] = 'Select IB or A-levels.';
    if (!academicInput.school_name.trim()) nextErrors['academic_input.school_name'] = 'School name is required.';
    if (!academicInput.school_country.trim()) nextErrors['academic_input.school_country'] = 'School country is required.';
    if (!academicInput.graduation_year) nextErrors['academic_input.graduation_year'] = 'Graduation year is required.';
    if (!academicInput.intended_clusters.length) nextErrors['academic_input.intended_clusters'] = 'Select at least one subject cluster.';
    return nextErrors;
  }, [programmeType, academicInput.school_name, academicInput.school_country, academicInput.graduation_year, academicInput.intended_clusters]);

  const validateSubjects = useCallback((nextErrors: Record<string, string>) => {
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
  }, [subjects, programmeType, parseNumber]);

  const validateStep3 = useCallback(() => {
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
  }, [validateSubjects, programmeType, academicInput, parseNumber, englishRequired, englishTestType, englishStatus, admissionsTests]);

  const validateStep4 = useCallback(() => {
    return {} as Record<string, string>;
  }, []);

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
    // For better UX, we allow moving back freely. 
    // Moving forward still requires validation to maintain data integrity.
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    // Validate current step before allowing forward movement
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

  const handleFinalSubmit = useCallback(() => {
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

    startTransition(async () => {
      try {
        const result = await saveStudentIntake(payload);
        if (!result?.success) {
          setStatusMessage(result?.message ?? 'Save failed.');
          return;
        }
        setStatusMessage('Profile saved successfully! Redirecting...');
        setIsRedirecting(true);
        // Use window.location for a harder redirect to clear any middleware/router stuckness
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 800);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Save failed.';
        setStatusMessage(message);
      }
    });
  }, [
    validateStep1, validateStep2, validateStep3, validateStep4,
    buildPayload, router
  ]);

  const goBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleFinalSubmit();
  };

  const stepItems = useMemo(
    () => [
      ...PROFILE_STEPS.map((step, index) => ({ step: index + 1, label: step.title })),
      { step: 5, label: 'Review' }
    ],
    []
  );

  const stepCompletion = useMemo<Record<number, boolean>>(() => {
    const step1Complete = Object.keys(validateStep1()).length === 0;
    const step2Complete = Object.keys(validateStep2()).length === 0;
    const step3Complete = Object.keys(validateStep3()).length === 0;
    const step4Complete =
      !!lifestylePreference.teaching_style ||
      !!lifestylePreference.desired_location_type ||
      !!lifestylePreference.campus_size ||
      lifestylePreference.extracurricular_interests.length > 0 ||
      !!lifestylePreference.other_extracurriculars.trim();
    return {
      1: step1Complete,
      2: step2Complete,
      3: step3Complete,
      4: step4Complete,
      5: step1Complete && step2Complete && step3Complete && step4Complete
    };
  }, [validateStep1, validateStep2, validateStep3, lifestylePreference.teaching_style, lifestylePreference.desired_location_type, lifestylePreference.campus_size, lifestylePreference.extracurricular_interests.length, lifestylePreference.other_extracurriculars]);

  const progressLabel = `Step ${currentStep} of 5`;
  const currentStepLabel = stepItems.find((item) => item.step === currentStep)?.label ?? 'Profile';
  const englishRequiredLabel =
    englishRequired === 'yes'
      ? 'Yes'
      : englishRequired === 'no'
        ? 'No'
        : englishRequired === 'not_sure'
          ? 'Not sure'
          : '';

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const renderStepIcon = (step: number) => {
    switch (step) {
      case 1: return <User className="w-4 h-4" />;
      case 2: return <GraduationCap className="w-4 h-4" />;
      case 3: return <Layout className="w-4 h-4" />;
      case 4: return <Heart className="w-4 h-4" />;
      case 5: return <Check className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <form className="relative font-sans" style={{ fontFamily: 'var(--font-outfit), sans-serif' }} onSubmit={handleSubmit}>
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 lg:sticky lg:top-24 h-fit">
          <div className="surface-card p-6 bg-background/60 backdrop-blur-xl rounded-[32px] border-border/50 shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/50 font-bold">{progressLabel}</p>
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-1">Your Journey</h3>
              <p className="text-xs text-muted-foreground font-medium">{currentStepLabel}</p>
            </div>

            <div className="space-y-3">
              {stepItems.map((item) => (
                <button
                  key={item.step}
                  type="button"
                  className={cn(
                    "w-full group relative flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300",
                    item.step === currentStep
                      ? "bg-primary/10 border border-primary/20 text-primary shadow-sm"
                      : "hover:bg-muted/50 border border-transparent text-foreground/60 hover:text-foreground",
                    stepCompletion[item.step] && item.step !== currentStep && "text-success/80"
                  )}
                  onClick={() => goToStep(item.step)}
                >
                  <div className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300",
                    item.step === currentStep
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                      : stepCompletion[item.step]
                        ? "bg-success/15 text-success"
                        : "bg-muted/80 text-foreground/40 group-hover:bg-muted group-hover:text-foreground/70"
                  )}>
                    {stepCompletion[item.step] && item.step !== currentStep ? <Check className="w-4 h-4" /> : renderStepIcon(item.step)}
                  </div>
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
                  </div>
                  {item.step === currentStep && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  )}
                </button>
              ))}
            </div>

            {initialPayload && (
              <button
                type="button"
                className="w-full mt-8 py-3.5 px-4 rounded-2xl bg-muted/50 hover:bg-muted border border-border/50 text-xs font-bold transition-all duration-200 text-foreground/70 hover:text-foreground"
                onClick={restoreSavedProfile}
              >
                Restore Last Progress
              </button>
            )}

          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {/* Top Horizontal Navigation */}
          <div className="mb-8 flex items-center gap-4">
            <nav className="flex-1 min-w-0 flex items-center justify-between gap-2 p-2 bg-muted/30 rounded-2xl border border-border/50 overflow-x-auto scrollbar-hide">
              {stepItems.map((item) => (
                <button
                  key={`top-nav-${item.step}`}
                  onClick={() => goToStep(item.step)}
                  className={cn(
                    "flex-1 min-w-[40px] h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                    item.step === currentStep
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : stepCompletion[item.step]
                        ? "bg-success/20 text-success"
                        : "text-foreground/40 hover:bg-muted"
                  )}
                >
                  {stepCompletion[item.step] && item.step !== currentStep ? <Check className="w-4 h-4" /> : renderStepIcon(item.step)}
                </button>
              ))}
            </nav>
            <ThemeToggle compact />
          </div>

          <div className="mb-10 lg:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-semibold text-primary uppercase tracking-widest mb-4">
              <Sparkles className="w-3 h-3" />
              <span>Step {currentStep} Profile Wizard</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-3">Let&apos;s personalize your experience</h2>
            <p className="text-muted-foreground text-sm max-w-xl">
              Tell us a bit about yourself so we can tailor our UK admissions guidance and match you with the best-fit programs.
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeInUp}
              className="space-y-8"
            >

              {currentStep === 1 ? (
                <section className="space-y-6 lg:space-y-8">
                  <h3>Personal information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="space-y-2 flex flex-col">
                      <span>First name</span>
                      <input
                        type="text"
                        value={personalInfo.first_name}
                        onChange={(event) => updatePersonalInfo('first_name', event.target.value)}
                      />
                      {errors['personal_information.first_name'] ? <em>{errors['personal_information.first_name']}</em> : null}
                    </label>
                    <label className="space-y-2 flex flex-col">
                      <span>Last name</span>
                      <input
                        type="text"
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                        value={personalInfo.last_name}
                        onChange={(event) => updatePersonalInfo('last_name', event.target.value)}
                      />
                      {errors['personal_information.last_name'] ? <em>{errors['personal_information.last_name']}</em> : null}
                    </label>
                    <label className="space-y-2 flex flex-col">
                      <span>Email</span>
                      <input
                        type="email"
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                        value={personalInfo.email}
                        onChange={(event) => updatePersonalInfo('email', event.target.value)}
                      />
                      {errors['personal_information.email'] ? <em>{errors['personal_information.email']}</em> : null}
                    </label>
                  </div>

                  <div className="p-6 rounded-[24px] border border-border/50 bg-muted/30 backdrop-blur-sm space-y-6">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-base font-semibold text-foreground">Nationality</span>
                        <p className="text-xs text-muted-foreground mt-1">Add more than one if needed.</p>
                      </div>
                      <button type="button" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider bg-transparent border-none cursor-pointer" onClick={addNationality}>
                        Add another
                      </button>
                    </div>
                    {nationalities.map((value, index) => (
                      <div key={`nationality-${index}`} className="flex gap-3 items-center">
                        <input
                          list="country-options"
                          className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                          value={value}
                          onChange={(event) => updateNationality(index, event.target.value)}
                          placeholder="Select nationality"
                        />
                        {nationalities.length > 1 ? (
                          <button type="button" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider bg-transparent border-none cursor-pointer" onClick={() => removeNationality(index)}>
                            Remove
                          </button>
                        ) : null}
                      </div>
                    ))}
                    {errors['personal_information.nationality'] ? <em>{errors['personal_information.nationality']}</em> : null}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="space-y-2 flex flex-col">
                      <span>Age (optional)</span>
                      <input
                        type="number"
                        min={10}
                        max={60}
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                        value={personalInfo.age}
                        onChange={(event) => updatePersonalInfo('age', event.target.value)}
                      />
                    </label>
                    <div className="space-y-2 flex flex-col">
                      <span>Gender (optional)</span>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { value: 'female', label: 'Female' },
                          { value: 'male', label: 'Male' },
                          { value: 'non_binary', label: 'Non-binary' },
                          { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={cn(
                              "relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer",
                              personalInfo.gender === option.value
                                ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                                : "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
                            )}
                          >
                            <input
                              type="radio"
                              name="gender"
                              className="accent-primary h-4 w-4"
                              value={option.value}
                              checked={personalInfo.gender === option.value}
                              onChange={(event) => updatePersonalInfo('gender', event.target.value)}
                            />
                            <span className="text-sm font-medium">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <label className="space-y-2 flex flex-col">
                      <span>Country of residence</span>
                      <input
                        list="country-options"
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                        value={personalInfo.resident_country}
                        onChange={(event) => updatePersonalInfo('resident_country', event.target.value)}
                      />
                      {errors['personal_information.resident_country'] ? (
                        <em>{errors['personal_information.resident_country']}</em>
                      ) : null}
                    </label>
                    <label className="space-y-2 flex flex-col">
                      <span>Current city (optional)</span>
                      <input
                        type="text"
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                        value={personalInfo.current_location_city}
                        onChange={(event) => updatePersonalInfo('current_location_city', event.target.value)}
                      />
                    </label>
                  </div>
                </section>
              ) : null}

              {currentStep === 2 ? (
                <section className="space-y-6 lg:space-y-8">
                  <h3>Academic input</h3>
                  <div className="space-y-2 flex flex-col">
                    <span>Which qualification are you taking?</span>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { value: 'IB', label: 'IB Diploma' },
                        { value: 'A_LEVEL', label: 'A-levels' }
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={cn(
                            "relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer",
                            programmeType === option.value
                              ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                              : "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
                          )}
                        >
                          <input
                            type="radio"
                            name="programme_type"
                            className="accent-primary h-4 w-4"
                            value={option.value}
                            checked={programmeType === option.value}
                            onChange={(event) => setProgrammeType(event.target.value as ProgrammeType)}
                          />
                          <span className="text-sm font-medium">{option.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors['academic_input.programme_type'] ? <em>{errors['academic_input.programme_type']}</em> : null}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="space-y-2 flex flex-col">
                      <span>School name</span>
                      <input
                        type="text"
                        value={academicInput.school_name}
                        onChange={(event) => updateAcademicInput('school_name', event.target.value)}
                      />
                      {errors['academic_input.school_name'] ? <em>{errors['academic_input.school_name']}</em> : null}
                    </label>
                    <label className="space-y-2 flex flex-col">
                      <span>School country</span>
                      <input
                        list="country-options"
                        value={academicInput.school_country}
                        onChange={(event) => updateAcademicInput('school_country', event.target.value)}
                      />
                      {errors['academic_input.school_country'] ? <em>{errors['academic_input.school_country']}</em> : null}
                    </label>
                    <label className="space-y-2 flex flex-col">
                      <span>School city (optional)</span>
                      <input
                        type="text"
                        value={academicInput.school_city}
                        onChange={(event) => updateAcademicInput('school_city', event.target.value)}
                      />
                    </label>
                    <label className="space-y-2 flex flex-col">
                      <span>School type (optional)</span>
                      <select
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="space-y-2 flex flex-col">
                      <span>Graduation year</span>
                      <select
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
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
                    <label className="space-y-2 flex flex-col">
                      <span>Desired UK start date (optional)</span>
                      <input
                        type="date"
                        value={academicInput.desired_start_date}
                        onChange={(event) => updateAcademicInput('desired_start_date', event.target.value)}
                      />
                    </label>
                  </div>

                  <div className="p-6 rounded-[24px] border border-border/50 bg-muted/30 backdrop-blur-sm space-y-6">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-base font-semibold text-foreground">What do you want to study?</span>
                        <p className="text-xs text-muted-foreground mt-1">Select one primary focus.</p>
                      </div>
                      <span className="text-xs underline cursor-help text-foreground/60" title="We use this to shortlist the most relevant programmes.">
                        Why we ask this
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {CLUSTER_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className={cn(
                            "relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer",
                            academicInput.intended_clusters.includes(option.value)
                              ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                              : "bg-card border-border hover:border-primary/50 hover:bg-muted/50",
                            !academicInput.intended_clusters.includes(option.value) &&
                            academicInput.intended_clusters.length >= 1 &&
                            "opacity-50 cursor-not-allowed hover:border-border hover:bg-card"
                          )}
                        >
                          <input
                            type="checkbox"
                            className="accent-primary h-4 w-4"
                            checked={academicInput.intended_clusters.includes(option.value)}
                            disabled={
                              !academicInput.intended_clusters.includes(option.value) &&
                              academicInput.intended_clusters.length >= 1
                            }
                            onChange={() => toggleCluster(option.value, 'intended_clusters')}
                          />
                          <span className="text-sm font-medium">{option.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors['academic_input.intended_clusters'] ? <em>{errors['academic_input.intended_clusters']}</em> : null}
                  </div>

                  <div className="p-6 rounded-[24px] border border-border/50 bg-muted/30 backdrop-blur-sm space-y-6">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-base font-semibold text-foreground">Any secondary interests? (optional)</span>
                        <p className="text-xs text-muted-foreground mt-1">Choose up to two.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {CLUSTER_OPTIONS.map((option) => (
                        <label
                          key={`secondary-${option.value}`}
                          className={cn(
                            "relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer",
                            academicInput.secondary_clusters.includes(option.value)
                              ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                              : "bg-card border-border hover:border-primary/50 hover:bg-muted/50",
                            !academicInput.secondary_clusters.includes(option.value) &&
                            academicInput.secondary_clusters.length >= 2 &&
                            "opacity-50 cursor-not-allowed hover:border-border hover:bg-card"
                          )}
                        >
                          <input
                            type="checkbox"
                            className="accent-primary h-4 w-4"
                            checked={academicInput.secondary_clusters.includes(option.value)}
                            disabled={
                              !academicInput.secondary_clusters.includes(option.value) &&
                              academicInput.secondary_clusters.length >= 2
                            }
                            onChange={() => toggleCluster(option.value, 'secondary_clusters')}
                          />
                          <span className="text-sm font-medium">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <label className="space-y-2 flex flex-col">
                    <span>Career aspiration (optional)</span>
                    <input
                      type="text"
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                      placeholder="Investment banking, Software engineer"
                      value={academicInput.career_aspiration}
                      onChange={(event) => updateAcademicInput('career_aspiration', event.target.value)}
                    />
                  </label>
                </section>
              ) : null}

              {currentStep === 3 ? (
                <section className="space-y-6 lg:space-y-8">
                  <h3>Academic details</h3>

                  <div className="p-6 rounded-[24px] border border-border/50 bg-muted/30 backdrop-blur-sm space-y-6">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-base font-semibold text-foreground">Your subjects and predicted grades</span>
                        <p className="text-xs text-muted-foreground mt-1">IB requires exactly 6 subjects with 3 HL.</p>
                      </div>
                      <button
                        type="button"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 text-xs font-bold uppercase tracking-wider border-none cursor-pointer"
                        onClick={addSubject}
                      >
                        <PlusCircle className="w-4 h-4" />
                        Add subject
                      </button>
                    </div>

                    <div className="subject-grid space-y-4">
                      {/* Desktop Header */}
                      <div className="hidden md:grid md:grid-cols-12 gap-6 px-6 py-2">
                        <div className="md:col-span-5 text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/40">Subject</div>
                        <div className="md:col-span-3 text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/40">Level</div>
                        <div className="md:col-span-3 text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/40">Predicted Grade</div>
                        <div className="md:col-span-1"></div>
                      </div>
                      {subjects.map((subject, index) => (
                        <div key={`subject-${index}`} className="subject-row">
                          <div className="md:col-span-5">
                            <label className="md:hidden">Subject</label>
                            <input
                              list="subject-options"
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                              value={subject.subject_name}
                              onChange={(event) => updateSubject(index, 'subject_name', event.target.value)}
                              placeholder="Enter subject name"
                            />
                            {errors[`academic_input.subject_list.${index}.subject_name`] ? (
                              <em className="text-destructive mt-1 block">{errors[`academic_input.subject_list.${index}.subject_name`]}</em>
                            ) : null}
                          </div>
                          <div className="md:col-span-3">
                            <label className="md:hidden">Level</label>
                            <select
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-200"
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
                          </div>
                          <div className="md:col-span-3">
                            <label className="md:hidden">Predicted grade</label>
                            {programmeType === 'IB' ? (
                              <input
                                type="number"
                                min={1}
                                max={7}
                                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-200"
                                value={subject.grade_value}
                                onChange={(event) => updateSubject(index, 'grade_value', event.target.value)}
                                placeholder="Grade"
                              />
                            ) : (
                              <select
                                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-200"
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
                            {errors[`academic_input.subject_list.${index}.grade_value`] ? (
                              <em className="text-destructive mt-1 block">{errors[`academic_input.subject_list.${index}.grade_value`]}</em>
                            ) : null}
                          </div>
                          <div className="md:col-span-1 flex items-end justify-center pb-2">
                            <button
                              type="button"
                              className="p-3 rounded-xl text-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all duration-200 border-none bg-transparent cursor-pointer"
                              onClick={() => removeSubject(index)}
                              title="Remove subject"
                            >
                              <Trash2 className="w-5 h-5" />
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
                      <div className="space-y-2 flex flex-col">
                        <span>Maths pathway</span>
                        <div className="flex flex-wrap gap-3">
                          {[
                            { value: 'AA_HL', label: 'AA HL' },
                            { value: 'AA_SL', label: 'AA SL' },
                            { value: 'AI_HL', label: 'AI HL' },
                            { value: 'AI_SL', label: 'AI SL' }
                          ].map((option) => (
                            <label
                              key={option.value}
                              className={cn(
                                "relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer",
                                academicInput.ib_math_pathway === option.value
                                  ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                                  : "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
                              )}
                            >
                              <input
                                type="radio"
                                name="ib_math_pathway"
                                className="accent-primary h-4 w-4"
                                value={option.value}
                                checked={academicInput.ib_math_pathway === option.value}
                                onChange={(event) => updateAcademicInput('ib_math_pathway', event.target.value)}
                              />
                              <span className="text-sm font-medium">{option.label}</span>
                            </label>
                          ))}
                        </div>
                        {errors['academic_input.ib_math_pathway'] ? <em>{errors['academic_input.ib_math_pathway']}</em> : null}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="space-y-2 flex flex-col">
                          <span>Predicted total IB points</span>
                          <input
                            type="number"
                            min={24}
                            max={45}
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                            value={academicInput.ib_total_points}
                            onChange={(event) => updateAcademicInput('ib_total_points', event.target.value)}
                          />
                          {errors['academic_input.ib_total_points'] ? <em>{errors['academic_input.ib_total_points']}</em> : null}
                        </label>
                        <label className="space-y-2 flex flex-col">
                          <span>Core points (optional)</span>
                          <input
                            type="number"
                            min={0}
                            max={3}
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                            value={academicInput.ib_core_points}
                            onChange={(event) => updateAcademicInput('ib_core_points', event.target.value)}
                          />
                          {errors['academic_input.ib_core_points'] ? <em>{errors['academic_input.ib_core_points']}</em> : null}
                        </label>
                        <label className="space-y-2 flex flex-col">
                          <span>TOK grade (optional)</span>
                          <select
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
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
                        <label className="space-y-2 flex flex-col">
                          <span>EE grade (optional)</span>
                          <select
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="space-y-2 flex flex-col">
                          <span>Extended Essay subject (optional)</span>
                          <input
                            type="text"
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                            value={academicInput.ee_subject}
                            onChange={(event) => updateAcademicInput('ee_subject', event.target.value)}
                          />
                        </label>
                        <label className="space-y-2 flex flex-col">
                          <span>Extended Essay title (optional)</span>
                          <input
                            type="text"
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                            value={academicInput.ee_title}
                            onChange={(event) => updateAcademicInput('ee_title', event.target.value)}
                          />
                        </label>
                      </div>
                      <label className="space-y-2 flex flex-col">
                        <span>Extended Essay summary (optional)</span>
                        <textarea
                          rows={3}
                          maxLength={350}
                          className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-y"
                          value={academicInput.ee_summary}
                          onChange={(event) => updateAcademicInput('ee_summary', event.target.value)}
                          placeholder="1–3 sentences max"
                        />
                        {errors['academic_input.ee_summary'] ? <em>{errors['academic_input.ee_summary']}</em> : null}
                      </label>
                    </>
                  ) : null}

                  <div className="p-6 rounded-[24px] border border-border/50 bg-muted/30 backdrop-blur-sm space-y-6">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-base font-semibold text-foreground">English proficiency</span>
                        <p className="text-xs text-muted-foreground mt-1">Some universities require a formal test score.</p>
                      </div>
                      <span className="text-xs underline cursor-help text-foreground/60" title="We use this to flag whether a language test is still needed.">
                        Why we ask this
                      </span>
                    </div>
                    <div className="space-y-2 flex flex-col">
                      <span>Will you need to prove English proficiency?</span>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { value: 'yes', label: 'Yes' },
                          { value: 'no', label: 'No' },
                          { value: 'not_sure', label: 'Not sure' }
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={cn(
                              "relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer",
                              englishRequired === option.value
                                ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                                : "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
                            )}
                          >
                            <input
                              type="radio"
                              name="english_required"
                              className="accent-primary h-4 w-4"
                              value={option.value}
                              checked={englishRequired === option.value}
                              onChange={(event) => setEnglishRequired(event.target.value as EnglishRequiredState)}
                            />
                            <span className="text-sm font-medium">{option.label}</span>
                          </label>
                        ))}
                      </div>
                      {errors['academic_input.english_required'] ? <em>{errors['academic_input.english_required']}</em> : null}
                    </div>

                    {englishRequired !== 'no' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="space-y-2 flex flex-col">
                          <span>English test type</span>
                          <select
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                            value={englishTestType}
                            onChange={(event) => setEnglishTestType(event.target.value as EnglishTestType)}
                          >
                            {ENGLISH_TEST_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors['academic_input.english_test_type'] ? <em>{errors['academic_input.english_test_type']}</em> : null}
                        </label>
                        <div className="space-y-2 flex flex-col">
                          <span>English test status</span>
                          <div className="flex flex-wrap gap-3">
                            {ENGLISH_STATUS_OPTIONS.map((option) => (
                              <label key={option.value} className={cn(
                                "relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer text-sm",
                                englishStatus === option.value
                                  ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                                  : "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
                              )}>
                                <input
                                  type="radio"
                                  name="english_status"
                                  className="accent-primary h-4 w-4"
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
                      <label className="space-y-2 flex flex-col">
                        <span>English overall score (optional)</span>
                        <input
                          type="number"
                          className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                          value={englishScoreOverall}
                          onChange={(event) => setEnglishScoreOverall(event.target.value)}
                        />
                      </label>
                    ) : null}
                  </div>

                  {showAdmissionsTests ? (
                    <div className="p-6 rounded-[24px] border border-border/50 bg-muted/30 backdrop-blur-sm space-y-6">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <span className="text-base font-semibold text-foreground">Admissions tests</span>
                          <p className="text-xs text-muted-foreground mt-1">Select the tests you have taken or booked.</p>
                        </div>
                        <span className="text-xs underline cursor-help text-foreground/60" title="Some subjects require admissions tests for eligibility.">
                          Why we ask this
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ADMISSIONS_TEST_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className={cn(
                              "relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer",
                              admissionsTests.some((test) => test.test_type === option.value)
                                ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                                : "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
                            )}
                          >
                            <input
                              type="checkbox"
                              className="accent-primary h-4 w-4"
                              checked={admissionsTests.some((test) => test.test_type === option.value)}
                              onChange={() => toggleAdmissionsTest(option.value)}
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>

                      {admissionsTests.filter((test) => test.test_type !== 'NONE').map((test, index) => (
                        <div key={`${test.test_type}-${index}`} className="p-5 rounded-2xl border border-border/50 bg-muted/30 grid grid-cols-1 md:grid-cols-12 gap-6 items-start relative overflow-hidden">
                          <div className="md:col-span-3">
                            <label>
                              Test
                              <input type="text" value={test.test_type} disabled className="opacity-70" />
                            </label>
                          </div>
                          <div className="md:col-span-5">
                            <label>Status</label>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { value: 'taken', label: 'Taken' },
                                { value: 'booked', label: 'Booked' },
                                { value: 'missing', label: 'Missing' }
                              ].map((option) => (
                                <label key={`${test.test_type}-${option.value}`} className={cn(
                                  "flex-1 min-w-[100px] relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-xs cursor-pointer",
                                  test.status === option.value
                                    ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                                    : "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
                                )}>
                                  <input
                                    type="radio"
                                    name={`admissions-status-${index}`}
                                    className="accent-primary h-4 w-4"
                                    value={option.value}
                                    checked={test.status === option.value}
                                    onChange={(event) => updateAdmissionsTest(index, 'status', event.target.value)}
                                  />
                                  {option.label}
                                </label>
                              ))}
                            </div>
                            {errors[`academic_input.admissions_tests.${index}.status`] ? (
                              <em className="text-destructive mt-1 block">{errors[`academic_input.admissions_tests.${index}.status`]}</em>
                            ) : null}
                          </div>
                          <div className="md:col-span-2">
                            <label>
                              Score
                              <input
                                type="number"
                                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                                value={test.score_numeric}
                                onChange={(event) => updateAdmissionsTest(index, 'score_numeric', event.target.value)}
                                placeholder="Value"
                              />
                            </label>
                          </div>
                          <div className="md:col-span-2">
                            <label>
                              Percentile
                              <input
                                type="number"
                                min={0}
                                max={100}
                                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                                value={test.percentile}
                                onChange={(event) => updateAdmissionsTest(index, 'percentile', event.target.value)}
                                placeholder="0-100"
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
                <section className="space-y-6 lg:space-y-8">
                  <h3>Lifestyle preferences</h3>
                  <div className="space-y-2 flex flex-col">
                    <span>Teaching style preference</span>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { value: 'academic', label: 'Academic' },
                        { value: 'practical', label: 'Practical' },
                        { value: 'mixed', label: 'Mixed' },
                        { value: '', label: 'No preference' }
                      ].map((option) => (
                        <label key={option.value} className={cn(
                          "relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer text-sm",
                          lifestylePreference.teaching_style === option.value
                            ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                            : "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
                        )}>
                          <input
                            type="radio"
                            name="teaching_style"
                            className="accent-primary h-4 w-4"
                            value={option.value}
                            checked={lifestylePreference.teaching_style === option.value}
                            onChange={(event) => updateLifestylePreference('teaching_style', event.target.value)}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <span>Preferred location type</span>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { value: 'london', label: 'London' },
                        { value: 'major_city', label: 'Major city' },
                        { value: 'smaller_city', label: 'Smaller city' },
                        { value: 'suburban', label: 'Suburban' },
                        { value: 'no_preference', label: 'No preference' }
                      ].map((option) => (
                        <label key={option.value} className={cn(
                          "relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer text-sm",
                          lifestylePreference.desired_location_type === option.value
                            ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                            : "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
                        )}>
                          <input
                            type="radio"
                            name="desired_location_type"
                            className="accent-primary h-4 w-4"
                            value={option.value}
                            checked={lifestylePreference.desired_location_type === option.value}
                            onChange={(event) => updateLifestylePreference('desired_location_type', event.target.value)}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <span>Campus size preference</span>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { value: 'small', label: 'Small' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'large', label: 'Large' },
                        { value: 'no_preference', label: 'No preference' }
                      ].map((option) => (
                        <label key={option.value} className={cn(
                          "relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer text-sm",
                          lifestylePreference.campus_size === option.value
                            ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                            : "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
                        )}>
                          <input
                            type="radio"
                            name="campus_size"
                            className="accent-primary h-4 w-4"
                            value={option.value}
                            checked={lifestylePreference.campus_size === option.value}
                            onChange={(event) => updateLifestylePreference('campus_size', event.target.value)}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 rounded-[24px] border border-border/50 bg-muted/30 backdrop-blur-sm space-y-6">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-base font-semibold text-foreground">Extracurricular interests</span>
                        <p className="text-xs text-muted-foreground mt-1">Select any that matter to your university experience.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {EXTRACURRICULAR_OPTIONS.map((option) => (
                        <label key={option} className={cn(
                          "relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer text-sm",
                          lifestylePreference.extracurricular_interests.includes(option)
                            ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                            : "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
                        )}>
                          <input
                            type="checkbox"
                            className="accent-primary h-4 w-4"
                            checked={lifestylePreference.extracurricular_interests.includes(option)}
                            onChange={() => toggleExtracurricular(option)}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                  <label className="space-y-2 flex flex-col">
                    <span>Other extracurriculars (optional)</span>
                    <input
                      type="text"
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                      value={lifestylePreference.other_extracurriculars}
                      onChange={(event) => updateLifestylePreference('other_extracurriculars', event.target.value)}
                    />
                  </label>
                </section>
              ) : null}

              {currentStep === 5 ? (
                <section className="space-y-6 lg:space-y-8 items-center text-center">
                  <h3>Review & submit</h3>
                  <p className="mt-1 text-foreground/60">Check everything below before submitting your profile.</p>
                  <div className="w-full max-w-[920px] mx-auto text-left rounded-2xl p-4 border border-border/50 bg-muted/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: 'Name', value: `${personalInfo.first_name || '—'} ${personalInfo.last_name || ''}`, step: 1 },
                        { label: 'Email', value: personalInfo.email, step: 1 },
                        { label: 'Nationality', value: formattedNationalities.join(', '), step: 1 },
                        { label: 'Age', value: personalInfo.age, step: 1 },
                        { label: 'Gender', value: personalInfo.gender, step: 1 },
                        { label: 'Residence', value: personalInfo.resident_country, step: 1 },
                        { label: 'Current city', value: personalInfo.current_location_city, step: 1 },
                        { label: 'Programme', value: programmeType, step: 2 },
                        { label: 'School', value: academicInput.school_name, step: 2 },
                        { label: 'School country', value: academicInput.school_country, step: 2 },
                        { label: 'School city', value: academicInput.school_city, step: 2 },
                        { label: 'School type', value: academicInput.school_type, step: 2 },
                        { label: 'Graduation year', value: academicInput.graduation_year, step: 2 },
                        { label: 'Start date', value: academicInput.desired_start_date, step: 2 },
                        { label: 'Primary subject', value: academicInput.intended_clusters.length ? academicInput.intended_clusters.map((cluster) => clusterLabelMap.get(cluster)).join(', ') : '', step: 2 },
                        { label: 'Secondary interests', value: academicInput.secondary_clusters.length ? academicInput.secondary_clusters.map((cluster) => clusterLabelMap.get(cluster)).join(', ') : '', step: 2 },
                        { label: 'Career aspiration', value: academicInput.career_aspiration, step: 2 },
                        { label: 'Subjects', value: subjects.filter((s) => s.subject_name.trim()).map((s) => `${s.subject_name} (${s.level}) ${s.grade_value || ''}`.trim()).join(', '), step: 3 }
                      ].map((item, idx) => (
                        <div key={idx} className="group p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col gap-1 hover:bg-muted/40 transition-all duration-200 relative">
                          <button
                            type="button"
                            onClick={() => goToStep(item.step)}
                            className="absolute top-3 right-3 p-2 rounded-lg bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            title="Edit this section"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] uppercase tracking-widest text-foreground/50 font-bold">{item.label}</span>
                          <p className="text-sm font-semibold text-foreground pr-8">{item.value || '—'}</p>
                        </div>
                      ))}

                      {programmeType === 'IB' ? (
                        <>
                          {[
                            { label: 'IB total points', value: academicInput.ib_total_points },
                            { label: 'IB core points', value: academicInput.ib_core_points },
                            { label: 'TOK grade', value: academicInput.ib_tok_grade },
                            { label: 'EE grade', value: academicInput.ib_ee_grade },
                            { label: 'Maths pathway', value: academicInput.ib_math_pathway },
                            { label: 'EE subject', value: academicInput.ee_subject },
                            { label: 'EE title', value: academicInput.ee_title },
                            { label: 'EE summary', value: academicInput.ee_summary }
                          ].map((item, idx) => (
                            <div key={`ib-${idx}`} className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col gap-1 hover:bg-muted/40 transition-colors duration-200">
                              <span className="text-[10px] uppercase tracking-widest text-foreground/60 font-semibold">{item.label}</span>
                              <p className="text-sm font-semibold text-foreground">{item.value || '—'}</p>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col gap-1 hover:bg-muted/40 transition-colors duration-200">
                          <span className="text-[10px] uppercase tracking-widest text-foreground/60 font-semibold">A-level predicted grades</span>
                          <p className="text-sm font-semibold text-foreground">
                            {subjects
                              .filter(s => programmeType === 'A_LEVEL' && s.grade_value)
                              .map(s => `${s.subject_name}: ${s.grade_value}`)
                              .join(', ') || '—'}
                          </p>
                        </div>
                      )}

                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col gap-1 hover:bg-muted/40 transition-colors duration-200">
                        <span className="text-[10px] uppercase tracking-widest text-foreground/60 font-semibold">English requirement</span>
                        <p className="text-sm font-semibold text-foreground">{englishRequiredLabel || '—'}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col gap-1 hover:bg-muted/40 transition-colors duration-200">
                        <span className="text-[10px] uppercase tracking-widest text-foreground/60 font-semibold">English test</span>
                        <p className="text-sm font-semibold text-foreground">{englishTestType || '—'} • {englishStatus || '—'}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col gap-1 hover:bg-muted/40 transition-colors duration-200">
                        <span className="text-[10px] uppercase tracking-widest text-foreground/60 font-semibold">Admissions tests</span>
                        <p className="text-sm font-semibold text-foreground">
                          {admissionsTests.filter((test) => test.test_type !== 'NONE').length
                            ? admissionsTests
                              .filter((test) => test.test_type !== 'NONE')
                              .map((test) => `${test.test_type} (${test.status || 'missing'})`)
                              .join(', ')
                            : '—'}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col gap-1 hover:bg-muted/40 transition-colors duration-200">
                        <span className="text-[10px] uppercase tracking-widest text-foreground/60 font-semibold">Lifestyle</span>
                        <p className="text-sm font-semibold text-foreground">
                          {[
                            lifestylePreference.teaching_style,
                            lifestylePreference.desired_location_type,
                            lifestylePreference.campus_size
                          ]
                            .filter(Boolean)
                            .join(' • ') || '—'}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col gap-1 hover:bg-muted/40 transition-colors duration-200">
                        <span className="text-[10px] uppercase tracking-widest text-foreground/60 font-semibold">Extracurriculars</span>
                        <p className="text-sm font-semibold text-foreground">{lifestylePreference.extracurricular_interests.join(', ') || '—'}</p>
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}

            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex items-center justify-between gap-4 p-6 surface-card bg-background/40 backdrop-blur-md rounded-[24px] border-border/50 shadow-xl">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={currentStep === 1}
              className="h-12 px-6 rounded-xl border-border/50 hover:bg-muted/30 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex gap-3">
              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={goNext}
                  className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                >
                  Next Step
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSaving || isRedirecting}
                  className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                >
                  {isSaving || isRedirecting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {isRedirecting ? 'Redirecting...' : 'Saving...'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Complete Profile
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>

          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm text-center"
            >
              {statusMessage}
            </motion.div>
          )}
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
        /* Global Reset & Typography */
        :global(form) {
          font-family: var(--font-outfit), sans-serif;
        }

        /* Premium Input Styles */
        :global(input), :global(select), :global(textarea) {
          @apply w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 outline-none placeholder:text-slate-400 text-slate-900 shadow-inner font-medium;
        }

        :global(.dark input), :global(.dark select), :global(.dark textarea) {
          @apply bg-slate-950/50 border-white/5 text-slate-100 placeholder:text-slate-600 focus:bg-slate-900 focus:border-primary/40 focus:ring-primary/10;
        }

        /* Field Groups (The main sections) */
        :global(.field-group) {
          @apply p-8 rounded-[40px] border border-slate-200/60 bg-white/70 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8 transition-all duration-500;
        }

        :global(.dark .field-group) {
          @apply border-white/5 bg-slate-900/40 shadow-none backdrop-blur-xl;
        }

        :global(label) {
          @apply text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 block px-1;
        }

        :global(.dark label) {
          @apply text-foreground/40;
        }

        :global(.helper) {
          @apply text-[11px] text-slate-500 mt-2 px-1 font-medium italic;
        }

        :global(.dark .helper) {
          @apply text-slate-500;
        }

        /* Interactive Cards (Radio/Checkbox) */
        :global(.radio), :global(.checkbox) {
          @apply relative flex items-center gap-3 p-5 rounded-2xl border border-slate-200/60 bg-slate-50/50 hover:border-primary/40 hover:bg-primary/[0.03] hover:scale-[1.01] hover:shadow-md cursor-pointer transition-all duration-300;
        }

        :global(.dark .radio), :global(.dark .checkbox) {
          @apply border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 hover:shadow-none;
        }

        :global(.radio input), :global(.checkbox input) {
          @apply w-5 h-5 rounded-full border border-slate-300 bg-white text-primary transition-all duration-300 focus:ring-offset-0 focus:ring-4 focus:ring-primary/10;
        }

        :global(.dark .radio input), :global(.dark .checkbox input) {
          @apply border-white/20 bg-transparent;
        }

        /* Subject Rows */
        :global(.subject-row) {
          @apply p-6 rounded-[28px] border border-slate-200/60 bg-white grid grid-cols-1 md:grid-cols-12 gap-6 items-start shadow-sm hover:shadow-md transition-all duration-300;
        }

        :global(.dark .subject-row) {
          @apply border-white/10 bg-white/[0.02] shadow-none;
        }

        /* Review Summary Items */
        :global(.review-item) {
          @apply p-5 rounded-3xl bg-slate-50/50 border border-slate-200/60 shadow-sm flex flex-col gap-2 hover:border-primary/30 hover:bg-primary/[0.02] hover:scale-[1.01] transition-all duration-300;
        }

        :global(.dark .review-item) {
          @apply bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20;
        }

        /* Sidebar Glassmorphism Fixes */
        :global(.surface-card) {
          @apply border border-slate-200/50 shadow-2xl bg-white/80 backdrop-blur-xl;
        }

        :global(.dark .surface-card) {
          @apply border-white/10 bg-slate-900/60 shadow-none;
        }
      `}</style>
    </form>
  );
};
