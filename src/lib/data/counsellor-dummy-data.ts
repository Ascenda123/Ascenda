// ─── Types ───────────────────────────────────────────────────────────────────

export type MatchTier = 'Reach' | 'Match' | 'Safe';
export type ApplicationStatus = 'planning' | 'in_progress' | 'submitted' | 'decision';
export type NoteType = 'session' | 'flag' | 'update';
export type DeadlineType = 'early_decision' | 'regular' | 'scholarship' | 'interview';
export type StudentFlag = 'profile_incomplete' | 'deadline_urgent' | 'no_matches' | 'stalled';

export interface CounsellorMatch {
  university: string;
  country: string;
  program: string;
  score: number;
  tier: MatchTier;
}

export interface CounsellorApplication {
  university: string;
  program: string;
  status: ApplicationStatus;
  deadline: string;
}

export interface CounsellorDeadline {
  id: string;
  university: string;
  program: string;
  date: string;
  type: DeadlineType;
  studentId: string;
}

export interface CounsellorNote {
  id: string;
  date: string;
  content: string;
  type: NoteType;
}

export interface CounsellorStudent {
  id: string;
  personal: {
    firstName: string;
    lastName: string;
    nationality: string;
    flagEmoji: string;
    school: string;
    schoolCity: string;
    schoolCountry: string;
    email: string;
  };
  academic: {
    programmeType: 'IB' | 'A_LEVEL';
    ibPoints?: number;
    aLevelGrades?: string;
    subjects: string[];
    clusters: string[];
    careerAspiration: string;
    englishStatus: 'met' | 'missing' | 'booked';
    admissionsTests: { type: string; status: string; score?: number }[];
    graduationYear: number;
  };
  lifestyle: {
    teachingStyle: 'academic' | 'practical' | 'mixed';
    locationPreference: string;
    campusSize: 'small' | 'medium' | 'large' | 'no_preference';
    interests: string[];
  };
  profile: {
    completionPct: number;
    stepsComplete: ('personal' | 'academic' | 'subjects' | 'lifestyle')[];
  };
  matches: CounsellorMatch[];
  applications: CounsellorApplication[];
  deadlines: CounsellorDeadline[];
  notes: CounsellorNote[];
  flags: StudentFlag[];
  lastActive: string;
}

// ─── Date helper (keeps dates relative to today so the demo stays fresh) ─────

function relDate(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// ─── Dummy Students ───────────────────────────────────────────────────────────

export const DUMMY_STUDENTS: CounsellorStudent[] = [
  // 1. Aarav Sharma — India, IB 38, CS/Engineering
  {
    id: 'student-1',
    personal: {
      firstName: 'Aarav',
      lastName: 'Sharma',
      nationality: 'Indian',
      flagEmoji: '🇮🇳',
      school: 'Dhirubhai Ambani International School',
      schoolCity: 'Mumbai',
      schoolCountry: 'India',
      email: 'aarav.sharma@dais.edu.in'
    },
    academic: {
      programmeType: 'IB',
      ibPoints: 38,
      subjects: ['Mathematics AA HL', 'Physics HL', 'Computer Science HL', 'Chemistry SL', 'English A SL', 'Economics SL'],
      clusters: ['computer_science', 'engineering'],
      careerAspiration: 'Software Engineer at a top tech company or AI researcher',
      englishStatus: 'met',
      admissionsTests: [{ type: 'TMUA', status: 'taken', score: 5.2 }],
      graduationYear: 2026
    },
    lifestyle: {
      teachingStyle: 'academic',
      locationPreference: 'london',
      campusSize: 'large',
      interests: ['Competitive programming', 'Robotics', 'Chess', 'Cricket']
    },
    profile: { completionPct: 100, stepsComplete: ['personal', 'academic', 'subjects', 'lifestyle'] },
    matches: [
      { university: 'Imperial College London', country: 'UK', program: 'MEng Computing', score: 72, tier: 'Reach' },
      { university: 'University College London', country: 'UK', program: 'BSc Computer Science', score: 78, tier: 'Match' },
      { university: 'University of Edinburgh', country: 'UK', program: 'BSc Artificial Intelligence', score: 82, tier: 'Match' },
      { university: 'University of Warwick', country: 'UK', program: 'BSc Computer Science', score: 88, tier: 'Safe' },
      { university: 'University of Bristol', country: 'UK', program: 'BSc Computer Science', score: 91, tier: 'Safe' },
      { university: 'University of Manchester', country: 'UK', program: 'BSc Computer Science', score: 89, tier: 'Safe' }
    ],
    applications: [
      { university: 'Imperial College London', program: 'MEng Computing', status: 'in_progress', deadline: relDate(60) },
      { university: 'University College London', program: 'BSc Computer Science', status: 'submitted', deadline: relDate(-47) },
      { university: 'University of Edinburgh', program: 'BSc Artificial Intelligence', status: 'planning', deadline: relDate(30) }
    ],
    deadlines: [
      { id: 'd1-1', university: 'Imperial College London', program: 'MEng Computing', date: relDate(60), type: 'early_decision', studentId: 'student-1' },
      { id: 'd1-2', university: 'University College London', program: 'BSc Computer Science', date: relDate(-47), type: 'regular', studentId: 'student-1' }
    ],
    notes: [
      { id: 'n1-1', date: relDate(-21), content: 'Aarav has strong TMUA score. Encouraged to apply to Imperial early decision. His personal statement draft is solid — needs to emphasise his ML project.', type: 'session' },
      { id: 'n1-2', date: relDate(-42), content: 'Discussed UCAS application strategy. Recommended adding Bristol as a safe choice.', type: 'session' },
      { id: 'n1-3', date: relDate(-57), content: 'Flagged: UCAS form not started yet. Chased by email.', type: 'flag' }
    ],
    flags: [],
    lastActive: relDate(-3)
  },

  // 2. Sofia Chen — Hong Kong, IB 42, PPE/Economics
  {
    id: 'student-2',
    personal: {
      firstName: 'Sofia',
      lastName: 'Chen',
      nationality: 'Hong Kong SAR',
      flagEmoji: '🇭🇰',
      school: 'Hong Kong International School',
      schoolCity: 'Hong Kong',
      schoolCountry: 'China',
      email: 'sofia.chen@hkis.edu.hk'
    },
    academic: {
      programmeType: 'IB',
      ibPoints: 42,
      subjects: ['Economics HL', 'History HL', 'English A HL', 'Mathematics AI SL', 'Mandarin B SL', 'Philosophy SL'],
      clusters: ['economics_quant', 'humanities'],
      careerAspiration: 'International policy analyst or investment banker in ESG',
      englishStatus: 'met',
      admissionsTests: [{ type: 'TSA', status: 'taken', score: 73 }],
      graduationYear: 2026
    },
    lifestyle: {
      teachingStyle: 'academic',
      locationPreference: 'london',
      campusSize: 'large',
      interests: ['Debate', 'Model UN', 'Journalism', 'Piano']
    },
    profile: { completionPct: 100, stepsComplete: ['personal', 'academic', 'subjects', 'lifestyle'] },
    matches: [
      { university: 'University of Oxford', country: 'UK', program: 'BA Philosophy, Politics & Economics', score: 68, tier: 'Reach' },
      { university: 'London School of Economics', country: 'UK', program: 'BSc Economics', score: 74, tier: 'Reach' },
      { university: 'University College London', country: 'UK', program: 'BSc Economics', score: 81, tier: 'Match' },
      { university: 'University of Warwick', country: 'UK', program: 'BSc Economics', score: 87, tier: 'Safe' },
      { university: 'University of Exeter', country: 'UK', program: 'BA Politics, Philosophy & Economics', score: 92, tier: 'Safe' }
    ],
    applications: [
      { university: 'University of Oxford', program: 'BA Philosophy, Politics & Economics', status: 'submitted', deadline: relDate(-140) },
      { university: 'London School of Economics', program: 'BSc Economics', status: 'submitted', deadline: relDate(-47) },
      { university: 'University College London', program: 'BSc Economics', status: 'submitted', deadline: relDate(-47) },
      { university: 'University of Warwick', program: 'BSc Economics', status: 'submitted', deadline: relDate(-47) }
    ],
    deadlines: [
      { id: 'd2-1', university: 'University of Oxford', program: 'BA PPE', date: relDate(7), type: 'interview', studentId: 'student-2' }
    ],
    notes: [
      { id: 'n2-1', date: relDate(-11), content: 'All 4 applications submitted. Oxford interview scheduled in 7 days. Conducting 3 mock interviews this week.', type: 'update' },
      { id: 'n2-2', date: relDate(-30), content: 'Sofia\'s personal statement was exceptional — clear intellectual curiosity around ESG policy. Submitted on time.', type: 'session' },
      { id: 'n2-3', date: relDate(-88), content: 'Predicted grades confirmed: 7-7-7-6-7-7 = 42 points. Strong candidate for LSE and UCL.', type: 'update' }
    ],
    flags: [],
    lastActive: relDate(-6)
  },

  // 3. Mohammed Al-Rashid — UAE, A-Level AAA, Engineering (profile incomplete)
  {
    id: 'student-3',
    personal: {
      firstName: 'Mohammed',
      lastName: 'Al-Rashid',
      nationality: 'Emirati',
      flagEmoji: '🇦🇪',
      school: 'GEMS Wellington International School',
      schoolCity: 'Dubai',
      schoolCountry: 'UAE',
      email: 'm.alrashid@gems.edu.ae'
    },
    academic: {
      programmeType: 'A_LEVEL',
      aLevelGrades: 'AAA (predicted)',
      subjects: ['Mathematics A*', 'Further Mathematics A', 'Physics A', 'Chemistry A'],
      clusters: ['engineering', 'computer_science'],
      careerAspiration: 'Aerospace or civil engineer',
      englishStatus: 'met',
      admissionsTests: [],
      graduationYear: 2026
    },
    lifestyle: {
      teachingStyle: 'practical',
      locationPreference: 'major_city',
      campusSize: 'large',
      interests: ['Football', 'Gaming', 'Drone racing']
    },
    profile: { completionPct: 50, stepsComplete: ['personal', 'academic'] },
    matches: [],
    applications: [
      { university: 'Imperial College London', program: 'MEng Aeronautical Engineering', status: 'planning', deadline: relDate(45) }
    ],
    deadlines: [
      { id: 'd3-1', university: 'Imperial College London', program: 'MEng Aeronautical Engineering', date: relDate(-5), type: 'regular', studentId: 'student-3' }
    ],
    notes: [
      { id: 'n3-1', date: relDate(-16), content: 'Mohammed hasn\'t completed his subjects or lifestyle sections. Sent a reminder — profile needs to be finished before we can generate matches. Deadline risk is high.', type: 'flag' },
      { id: 'n3-2', date: relDate(-52), content: 'Initial session: Mohammed is interested in aerospace. Advised him on UCAS personal statement structure.', type: 'session' }
    ],
    flags: ['profile_incomplete'],
    lastActive: relDate(-16)
  },

  // 4. Isabella Martinez — Brazil, IB 35, Business
  {
    id: 'student-4',
    personal: {
      firstName: 'Isabella',
      lastName: 'Martinez',
      nationality: 'Brazilian',
      flagEmoji: '🇧🇷',
      school: 'Saint Paul\'s School São Paulo',
      schoolCity: 'São Paulo',
      schoolCountry: 'Brazil',
      email: 'i.martinez@stpauls.br'
    },
    academic: {
      programmeType: 'IB',
      ibPoints: 35,
      subjects: ['Business Management HL', 'Economics HL', 'Spanish A HL', 'Mathematics AI SL', 'English B SL', 'Psychology SL'],
      clusters: ['business_non_quant', 'economics_quant'],
      careerAspiration: 'Entrepreneur or brand strategist in sustainable fashion',
      englishStatus: 'booked',
      admissionsTests: [],
      graduationYear: 2026
    },
    lifestyle: {
      teachingStyle: 'mixed',
      locationPreference: 'major_city',
      campusSize: 'medium',
      interests: ['Fashion design', 'Sustainability', 'Entrepreneurship', 'Salsa dancing']
    },
    profile: { completionPct: 100, stepsComplete: ['personal', 'academic', 'subjects', 'lifestyle'] },
    matches: [
      { university: 'University of Edinburgh', country: 'UK', program: 'MA Business Management', score: 76, tier: 'Match' },
      { university: 'Durham University', country: 'UK', program: 'BA Business Finance', score: 80, tier: 'Match' },
      { university: 'University of Bristol', country: 'UK', program: 'BSc Management', score: 83, tier: 'Safe' },
      { university: 'University of Leeds', country: 'UK', program: 'BA International Business', score: 87, tier: 'Safe' },
      { university: 'University of Exeter', country: 'UK', program: 'BA Business and Management', score: 89, tier: 'Safe' }
    ],
    applications: [
      { university: 'University of Edinburgh', program: 'MA Business Management', status: 'in_progress', deadline: relDate(-47) },
      { university: 'Durham University', program: 'BA Business Finance', status: 'in_progress', deadline: relDate(-47) },
      { university: 'University of Bristol', program: 'BSc Management', status: 'planning', deadline: relDate(-47) }
    ],
    deadlines: [
      { id: 'd4-1', university: 'University of Edinburgh', program: 'MA Business Management', date: relDate(12), type: 'regular', studentId: 'student-4' },
      { id: 'd4-2', university: 'IELTS', program: 'English Language Test', date: relDate(3), type: 'scholarship', studentId: 'student-4' }
    ],
    notes: [
      { id: 'n4-1', date: relDate(-9), content: 'Isabella is on track. Edinburgh and Durham apps are in good shape. IELTS is her remaining risk — booked for this week.', type: 'session' },
      { id: 'n4-2', date: relDate(-30), content: 'Reviewed personal statement. Strong passion for sustainable business but needs to cut 150 words. Will revise by next week.', type: 'session' }
    ],
    flags: [],
    lastActive: relDate(-9)
  },

  // 5. Yuki Tanaka — Japan, IB 40, Medicine (deadline urgent)
  {
    id: 'student-5',
    personal: {
      firstName: 'Yuki',
      lastName: 'Tanaka',
      nationality: 'Japanese',
      flagEmoji: '🇯🇵',
      school: 'British School in Tokyo',
      schoolCity: 'Tokyo',
      schoolCountry: 'Japan',
      email: 'yuki.tanaka@bst.ac.jp'
    },
    academic: {
      programmeType: 'IB',
      ibPoints: 40,
      subjects: ['Biology HL', 'Chemistry HL', 'Mathematics AA HL', 'Physics SL', 'English A SL', 'Japanese A SL'],
      clusters: ['medicine_dentistry', 'life_sciences_biochem'],
      careerAspiration: 'Paediatric surgeon with a focus on global health equity',
      englishStatus: 'met',
      admissionsTests: [
        { type: 'UCAT', status: 'taken', score: 2870 },
        { type: 'BMAT', status: 'taken', score: 6.2 }
      ],
      graduationYear: 2026
    },
    lifestyle: {
      teachingStyle: 'academic',
      locationPreference: 'london',
      campusSize: 'large',
      interests: ['Volunteering at clinics', 'Kendo', 'Origami', 'Medical research']
    },
    profile: { completionPct: 100, stepsComplete: ['personal', 'academic', 'subjects', 'lifestyle'] },
    matches: [
      { university: "King's College London", country: 'UK', program: 'MBBS Medicine', score: 71, tier: 'Reach' },
      { university: 'University of Manchester', country: 'UK', program: 'MBChB Medicine', score: 76, tier: 'Match' },
      { university: 'University of Leeds', country: 'UK', program: 'MBChB Medicine', score: 80, tier: 'Match' },
      { university: 'University of Glasgow', country: 'UK', program: 'MBChB Medicine', score: 84, tier: 'Safe' }
    ],
    applications: [
      { university: "King's College London", program: 'MBBS Medicine', status: 'submitted', deadline: relDate(-140) },
      { university: 'University of Manchester', program: 'MBChB Medicine', status: 'submitted', deadline: relDate(-140) },
      { university: 'University of Leeds', program: 'MBChB Medicine', status: 'submitted', deadline: relDate(-140) },
      { university: 'University of Glasgow', program: 'MBChB Medicine', status: 'submitted', deadline: relDate(-140) }
    ],
    deadlines: [
      { id: 'd5-1', university: "King's College London", program: 'MBBS Medicine', date: relDate(2), type: 'interview', studentId: 'student-5' },
      { id: 'd5-2', university: 'University of Manchester', program: 'MBChB Medicine', date: relDate(6), type: 'interview', studentId: 'student-5' }
    ],
    notes: [
      { id: 'n5-1', date: relDate(-4), content: 'URGENT: King\'s interview in 2 days. Running daily mock MMI sessions. Yuki is anxious but very well prepared. Focus on empathy stations.', type: 'flag' },
      { id: 'n5-2', date: relDate(-11), content: 'Confirmed KCL interview date in 2 days. Manchester interview in 6 days. Scheduling intensive prep this week.', type: 'update' },
      { id: 'n5-3', date: relDate(-47), content: 'All 4 medicine applications submitted. UCAT score 2870 is competitive. Work experience section was excellent.', type: 'session' }
    ],
    flags: ['deadline_urgent'],
    lastActive: relDate(-4)
  },

  // 6. Lucas Müller — Germany, A-Level A*AA, Mathematics
  {
    id: 'student-6',
    personal: {
      firstName: 'Lucas',
      lastName: 'Müller',
      nationality: 'German',
      flagEmoji: '🇩🇪',
      school: 'Berlin International School',
      schoolCity: 'Berlin',
      schoolCountry: 'Germany',
      email: 'lucas.muller@bis-berlin.de'
    },
    academic: {
      programmeType: 'A_LEVEL',
      aLevelGrades: 'A*AA (predicted)',
      subjects: ['Mathematics A*', 'Further Mathematics A', 'Computer Science A'],
      clusters: ['maths', 'computer_science'],
      careerAspiration: 'Quantitative researcher or academic mathematician',
      englishStatus: 'met',
      admissionsTests: [
        { type: 'STEP', status: 'booked' },
        { type: 'MAT', status: 'taken', score: 82 }
      ],
      graduationYear: 2026
    },
    lifestyle: {
      teachingStyle: 'academic',
      locationPreference: 'no_preference',
      campusSize: 'no_preference',
      interests: ['Mathematical olympiads', 'Chess', 'Classical music', 'Cycling']
    },
    profile: { completionPct: 100, stepsComplete: ['personal', 'academic', 'subjects', 'lifestyle'] },
    matches: [
      { university: 'University of Cambridge', country: 'UK', program: 'BA Mathematics', score: 66, tier: 'Reach' },
      { university: 'University of Oxford', country: 'UK', program: 'MMath Mathematics', score: 64, tier: 'Reach' },
      { university: 'University of Bristol', country: 'UK', program: 'BSc Mathematics', score: 84, tier: 'Safe' },
      { university: 'University of Exeter', country: 'UK', program: 'BSc Mathematics', score: 90, tier: 'Safe' }
    ],
    applications: [
      { university: 'University of Cambridge', program: 'BA Mathematics', status: 'submitted', deadline: relDate(-140) },
      { university: 'University of Oxford', program: 'MMath Mathematics', status: 'submitted', deadline: relDate(-140) },
      { university: 'University of Bristol', program: 'BSc Mathematics', status: 'submitted', deadline: relDate(-47) }
    ],
    deadlines: [
      { id: 'd6-1', university: 'University of Cambridge', program: 'BA Mathematics', date: relDate(29), type: 'regular', studentId: 'student-6' }
    ],
    notes: [
      { id: 'n6-1', date: relDate(-13), content: 'Lucas received Cambridge interview feedback — strong on problem solving but needs to improve communication of working. Oxford decision expected soon.', type: 'update' },
      { id: 'n6-2', date: relDate(-37), content: 'MAT score 82 is excellent. STEP prep is ongoing — on track for distinction level.', type: 'session' }
    ],
    flags: [],
    lastActive: relDate(-13)
  },

  // 7. Priya Nair — India, IB 36, Law (profile incomplete)
  {
    id: 'student-7',
    personal: {
      firstName: 'Priya',
      lastName: 'Nair',
      nationality: 'Indian',
      flagEmoji: '🇮🇳',
      school: 'Ecole Mondiale World School',
      schoolCity: 'Mumbai',
      schoolCountry: 'India',
      email: 'priya.nair@ecolemondiale.org'
    },
    academic: {
      programmeType: 'IB',
      ibPoints: 36,
      subjects: ['History HL', 'English A HL', 'Economics HL', 'Mathematics AI SL', 'Hindi A SL'],
      clusters: ['law', 'humanities'],
      careerAspiration: 'Human rights lawyer or international arbitration specialist',
      englishStatus: 'met',
      admissionsTests: [{ type: 'LNAT', status: 'booked' }],
      graduationYear: 2026
    },
    lifestyle: {
      teachingStyle: 'academic',
      locationPreference: 'london',
      campusSize: 'medium',
      interests: ['Moot court', 'Creative writing', 'Classical dance', 'Volunteering']
    },
    profile: { completionPct: 75, stepsComplete: ['personal', 'academic', 'subjects'] },
    matches: [
      { university: 'University College London', country: 'UK', program: 'LLB Law', score: 73, tier: 'Match' },
      { university: 'University of Exeter', country: 'UK', program: 'LLB Law', score: 85, tier: 'Safe' }
    ],
    applications: [],
    deadlines: [
      { id: 'd7-1', university: 'LNAT', program: 'Law National Aptitude Test', date: relDate(9), type: 'regular', studentId: 'student-7' }
    ],
    notes: [
      { id: 'n7-1', date: relDate(-6), content: 'Priya hasn\'t filled in lifestyle preferences — matches are limited as a result. Sent a reminder to complete profile this week. LNAT booked for next week.', type: 'flag' },
      { id: 'n7-2', date: relDate(-21), content: 'Good session — reviewed LNAT practice papers. Score is improving (63 → 68 in mocks). Encouraged to complete the application list.', type: 'session' }
    ],
    flags: ['profile_incomplete'],
    lastActive: relDate(-6)
  },

  // 8. Emma Thompson — Australia, A-Level AAB, Creative Arts
  {
    id: 'student-8',
    personal: {
      firstName: 'Emma',
      lastName: 'Thompson',
      nationality: 'Australian',
      flagEmoji: '🇦🇺',
      school: 'Sydney International Grammar School',
      schoolCity: 'Sydney',
      schoolCountry: 'Australia',
      email: 'emma.thompson@sigs.edu.au'
    },
    academic: {
      programmeType: 'A_LEVEL',
      aLevelGrades: 'AAB (predicted)',
      subjects: ['Art A', 'English Literature A', 'Psychology B'],
      clusters: ['creative', 'humanities'],
      careerAspiration: 'Fashion designer or creative director at a global brand',
      englishStatus: 'met',
      admissionsTests: [],
      graduationYear: 2026
    },
    lifestyle: {
      teachingStyle: 'practical',
      locationPreference: 'london',
      campusSize: 'small',
      interests: ['Fashion design', 'Photography', 'Illustration', 'Vintage markets']
    },
    profile: { completionPct: 100, stepsComplete: ['personal', 'academic', 'subjects', 'lifestyle'] },
    matches: [
      { university: 'University of the Arts London', country: 'UK', program: 'BA Fashion Design', score: 75, tier: 'Match' },
      { university: 'Goldsmiths, University of London', country: 'UK', program: 'BA Design', score: 79, tier: 'Match' },
      { university: 'Ravensbourne University London', country: 'UK', program: 'BA Fashion Design & Marketing', score: 88, tier: 'Safe' }
    ],
    applications: [
      { university: 'University of the Arts London', program: 'BA Fashion Design', status: 'in_progress', deadline: relDate(-16) },
      { university: 'Goldsmiths, University of London', program: 'BA Design', status: 'in_progress', deadline: relDate(-47) }
    ],
    deadlines: [
      { id: 'd8-1', university: 'University of the Arts London', program: 'BA Fashion Design', date: relDate(17), type: 'interview', studentId: 'student-8' }
    ],
    notes: [
      { id: 'n8-1', date: relDate(-8), content: 'Emma\'s portfolio is strong. UAL interview scheduled in 17 days. Advised to include 3D construction work and mood boards.', type: 'session' },
      { id: 'n8-2', date: relDate(-26), content: 'Reviewed portfolio draft. The sustainability capsule collection piece is the standout. Needs 2 more process pages.', type: 'session' }
    ],
    flags: [],
    lastActive: relDate(-8)
  },

  // 9. James Okafor — Nigeria, A-Level A*A*A, Economics
  {
    id: 'student-9',
    personal: {
      firstName: 'James',
      lastName: 'Okafor',
      nationality: 'Nigerian',
      flagEmoji: '🇳🇬',
      school: 'Lekki British International High School',
      schoolCity: 'Lagos',
      schoolCountry: 'Nigeria',
      email: 'james.okafor@lbih.edu.ng'
    },
    academic: {
      programmeType: 'A_LEVEL',
      aLevelGrades: 'A*A*A (predicted)',
      subjects: ['Economics A*', 'Mathematics A*', 'History A'],
      clusters: ['economics_quant', 'business_non_quant'],
      careerAspiration: 'Development economist or finance minister of Nigeria',
      englishStatus: 'met',
      admissionsTests: [],
      graduationYear: 2026
    },
    lifestyle: {
      teachingStyle: 'academic',
      locationPreference: 'london',
      campusSize: 'large',
      interests: ['Football', 'Public speaking', 'African political economy', 'Investing']
    },
    profile: { completionPct: 100, stepsComplete: ['personal', 'academic', 'subjects', 'lifestyle'] },
    matches: [
      { university: 'London School of Economics', country: 'UK', program: 'BSc Economics', score: 76, tier: 'Reach' },
      { university: 'University of Warwick', country: 'UK', program: 'BSc Economics', score: 82, tier: 'Match' },
      { university: 'University of Exeter', country: 'UK', program: 'BA Economics', score: 90, tier: 'Safe' },
      { university: 'University of Leeds', country: 'UK', program: 'BA Economics', score: 92, tier: 'Safe' }
    ],
    applications: [
      { university: 'London School of Economics', program: 'BSc Economics', status: 'submitted', deadline: relDate(-47) },
      { university: 'University of Warwick', program: 'BSc Economics', status: 'submitted', deadline: relDate(-47) },
      { university: 'University of Exeter', program: 'BA Economics', status: 'submitted', deadline: relDate(-47) }
    ],
    deadlines: [
      { id: 'd9-1', university: 'University of Warwick', program: 'BSc Economics', date: relDate(22), type: 'scholarship', studentId: 'student-9' }
    ],
    notes: [
      { id: 'n9-1', date: relDate(-5), content: 'All 3 applications submitted. James wrote a compelling personal statement — strong economic analysis and passion for development economics. Watching for LSE decision.', type: 'update' },
      { id: 'n9-2', date: relDate(-19), content: 'Warwick scholarship application due in 22 days. Helped James draft his scholarship essay around development economics research.', type: 'session' }
    ],
    flags: [],
    lastActive: relDate(-5)
  },

  // 10. Chloe Dubois — France, IB 41, Life Sciences
  {
    id: 'student-10',
    personal: {
      firstName: 'Chloe',
      lastName: 'Dubois',
      nationality: 'French',
      flagEmoji: '🇫🇷',
      school: 'Lycée International de Saint-Germain-en-Laye',
      schoolCity: 'Paris',
      schoolCountry: 'France',
      email: 'chloe.dubois@ligny.fr'
    },
    academic: {
      programmeType: 'IB',
      ibPoints: 41,
      subjects: ['Biology HL', 'Chemistry HL', 'Mathematics AA SL', 'French A HL', 'English B SL', 'Environmental Systems SL'],
      clusters: ['life_sciences_biochem', 'medicine_dentistry'],
      careerAspiration: 'Biochemistry researcher in cancer therapeutics',
      englishStatus: 'met',
      admissionsTests: [],
      graduationYear: 2026
    },
    lifestyle: {
      teachingStyle: 'academic',
      locationPreference: 'major_city',
      campusSize: 'large',
      interests: ['Lab research', 'Trail running', 'French cinema', 'Debate']
    },
    profile: { completionPct: 100, stepsComplete: ['personal', 'academic', 'subjects', 'lifestyle'] },
    matches: [
      { university: 'University of Edinburgh', country: 'UK', program: 'BSc Biochemistry', score: 80, tier: 'Match' },
      { university: 'University of Bristol', country: 'UK', program: 'BSc Biochemistry', score: 83, tier: 'Match' },
      { university: 'University of Leeds', country: 'UK', program: 'BSc Biochemistry', score: 87, tier: 'Safe' },
      { university: 'University of Manchester', country: 'UK', program: 'BSc Biochemistry', score: 89, tier: 'Safe' }
    ],
    applications: [
      { university: 'University of Edinburgh', program: 'BSc Biochemistry', status: 'submitted', deadline: relDate(-47) },
      { university: 'University of Bristol', program: 'BSc Biochemistry', status: 'submitted', deadline: relDate(-47) },
      { university: 'University of Leeds', program: 'BSc Biochemistry', status: 'in_progress', deadline: relDate(-47) }
    ],
    deadlines: [
      { id: 'd10-1', university: 'University of Edinburgh', program: 'BSc Biochemistry', date: relDate(38), type: 'regular', studentId: 'student-10' }
    ],
    notes: [
      { id: 'n10-1', date: relDate(-7), content: 'Edinburgh and Bristol applications in. Chloe\'s research background is exceptional — 3 months lab internship at Institut Pasteur is a real differentiator.', type: 'session' },
      { id: 'n10-2', date: relDate(-34), content: 'Reviewed Chloe\'s personal statement. Her description of the cancer therapeutics project is compelling. Minor edits suggested on structure.', type: 'session' }
    ],
    flags: [],
    lastActive: relDate(-7)
  }
];

// ─── Derived / Computed Helpers ───────────────────────────────────────────────

export const getCohortStats = () => {
  const total = DUMMY_STUDENTS.length;
  const avgCompletion = Math.round(DUMMY_STUDENTS.reduce((acc, s) => acc + s.profile.completionPct, 0) / total);
  const flagged = DUMMY_STUDENTS.filter((s) => s.flags.length > 0).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inOneWeek = new Date(today);
  inOneWeek.setDate(inOneWeek.getDate() + 7);

  const deadlinesThisWeek = DUMMY_STUDENTS.flatMap((s) =>
    s.deadlines.filter((d) => {
      const date = new Date(d.date);
      return date >= today && date <= inOneWeek;
    })
  ).length;

  const matchCounts = DUMMY_STUDENTS.flatMap((s) => s.matches);
  const reachCount = matchCounts.filter((m) => m.tier === 'Reach').length;
  const matchCount = matchCounts.filter((m) => m.tier === 'Match').length;
  const safeCount = matchCounts.filter((m) => m.tier === 'Safe').length;

  const appStatuses = DUMMY_STUDENTS.flatMap((s) => s.applications);
  const planningCount = appStatuses.filter((a) => a.status === 'planning').length;
  const inProgressCount = appStatuses.filter((a) => a.status === 'in_progress').length;
  const submittedCount = appStatuses.filter((a) => a.status === 'submitted').length;
  const decisionCount = appStatuses.filter((a) => a.status === 'decision').length;

  const ibCount = DUMMY_STUDENTS.filter((s) => s.academic.programmeType === 'IB').length;
  const aLevelCount = DUMMY_STUDENTS.filter((s) => s.academic.programmeType === 'A_LEVEL').length;

  return {
    total,
    avgCompletion,
    flagged,
    deadlinesThisWeek,
    matchTiers: { reach: reachCount, match: matchCount, safe: safeCount },
    appFunnel: { planning: planningCount, inProgress: inProgressCount, submitted: submittedCount, decision: decisionCount },
    programmeBreakdown: { ib: ibCount, aLevel: aLevelCount }
  };
};

export const getUpcomingDeadlines = (withinDays = 30) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + withinDays);

  return DUMMY_STUDENTS.flatMap((s) =>
    s.deadlines.map((d) => ({
      ...d,
      studentName: `${s.personal.firstName} ${s.personal.lastName}`,
      studentFlag: s.personal.flagEmoji,
      daysUntil: Math.ceil((new Date(d.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }))
  )
    .filter((d) => new Date(d.date) >= today && new Date(d.date) <= cutoff)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getAllDeadlines = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return DUMMY_STUDENTS.flatMap((s) =>
    s.deadlines.map((d) => ({
      ...d,
      studentName: `${s.personal.firstName} ${s.personal.lastName}`,
      studentFlag: s.personal.flagEmoji,
      daysUntil: Math.ceil((new Date(d.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getRecentActivity = () => {
  return DUMMY_STUDENTS.flatMap((s) =>
    s.notes.map((n) => ({
      ...n,
      studentName: `${s.personal.firstName} ${s.personal.lastName}`,
      studentId: s.id,
      studentFlag: s.personal.flagEmoji
    }))
  )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
};

export const getFieldDistribution = () => {
  const clusterCounts: Record<string, number> = {};
  DUMMY_STUDENTS.forEach((s) => {
    s.academic.clusters.forEach((c) => {
      clusterCounts[c] = (clusterCounts[c] || 0) + 1;
    });
  });

  const labels: Record<string, string> = {
    computer_science: 'Computer Science',
    engineering: 'Engineering',
    economics_quant: 'Economics',
    business_non_quant: 'Business',
    maths: 'Mathematics',
    medicine_dentistry: 'Medicine',
    life_sciences_biochem: 'Life Sciences',
    law: 'Law',
    humanities: 'Humanities',
    creative: 'Creative Arts'
  };

  return Object.entries(clusterCounts)
    .map(([key, count]) => ({ key, label: labels[key] || key, count }))
    .sort((a, b) => b.count - a.count);
};
