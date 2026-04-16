// ─── Types ───────────────────────────────────────────────────────────────────

export type MatchTier = 'Reach' | 'Match' | 'Safe';
export type ApplicationStatus = 'planning' | 'in_progress' | 'submitted' | 'decision';
export type NoteType = 'session' | 'flag' | 'update';
export type DeadlineType = 'early_decision' | 'regular' | 'scholarship' | 'interview';
export type StudentFlag = 'profile_incomplete' | 'deadline_urgent' | 'no_matches' | 'stalled';
export type OutcomeResult = 'accepted' | 'rejected' | 'waitlisted' | 'pending' | 'withdrawn';
export type ApplicationPlatform = 'UCAS' | 'Common App' | 'Direct' | 'Coalition' | 'OUAC';

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
  platform?: ApplicationPlatform;
  country?: string;
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

// ─── Outcome Tracking ───────────────────────────────────────────────────────

export interface CounsellorOutcome {
  id: string;
  studentId: string;
  studentName: string;
  university: string;
  program: string;
  country: string;
  tier: MatchTier;
  platform: ApplicationPlatform;
  result: OutcomeResult;
  responseDate: string | null;
  conditions: string | null;
}

function inferPlatform(uni: string): ApplicationPlatform {
  if (uni.includes('Arts London') || uni.includes('Goldsmiths')) return 'UCAS';
  return 'UCAS'; // All UK universities use UCAS in this demo
}

function inferCountry(_uni: string): string {
  return 'UK'; // All demo universities are UK-based
}

export const DUMMY_OUTCOMES: CounsellorOutcome[] = (() => {
  const results: CounsellorOutcome[] = [];
  const outcomePool: { result: OutcomeResult; weight: number }[] = [
    { result: 'accepted', weight: 40 },
    { result: 'rejected', weight: 20 },
    { result: 'waitlisted', weight: 15 },
    { result: 'pending', weight: 20 },
    { result: 'withdrawn', weight: 5 },
  ];
  let idx = 0;
  DUMMY_STUDENTS.forEach((student) => {
    const name = `${student.personal.firstName} ${student.personal.lastName}`;
    student.applications.forEach((app) => {
      const tier: MatchTier = student.matches.find((m) => m.university === app.university)?.tier ?? 'Match';
      // Deterministic result based on index
      const poolIdx = idx % 20;
      let cumulative = 0;
      let result: OutcomeResult = 'pending';
      for (const o of outcomePool) {
        cumulative += o.weight;
        if (poolIdx < cumulative / 5) { result = o.result; break; }
      }
      // Override: planning/in_progress apps are always pending
      if (app.status === 'planning' || app.status === 'in_progress') result = 'pending';

      results.push({
        id: `outcome-${student.id}-${idx}`,
        studentId: student.id,
        studentName: name,
        university: app.university,
        program: app.program,
        country: inferCountry(app.university),
        tier,
        platform: inferPlatform(app.university),
        result,
        responseDate: result !== 'pending' ? relDate(-Math.floor(Math.random() * 30 + 5)) : null,
        conditions: result === 'accepted' && tier === 'Reach' ? 'Conditional on final grades' : null,
      });
      idx++;
    });
  });
  return results;
})();

export const getOutcomeStats = () => {
  const total = DUMMY_OUTCOMES.length;
  const accepted = DUMMY_OUTCOMES.filter((o) => o.result === 'accepted').length;
  const rejected = DUMMY_OUTCOMES.filter((o) => o.result === 'rejected').length;
  const waitlisted = DUMMY_OUTCOMES.filter((o) => o.result === 'waitlisted').length;
  const pending = DUMMY_OUTCOMES.filter((o) => o.result === 'pending').length;
  const withdrawn = DUMMY_OUTCOMES.filter((o) => o.result === 'withdrawn').length;
  const decided = total - pending;
  const acceptanceRate = decided > 0 ? Math.round((accepted / decided) * 100) : 0;
  return { total, accepted, rejected, waitlisted, pending, withdrawn, acceptanceRate };
};

// ─── At-Risk Alerts ─────────────────────────────────────────────────────────

export type RiskType = 'essay_not_started' | 'missing_documents' | 'stalled_application' | 'low_completion' | 'deadline_approaching';
export type RiskUrgency = 'critical' | 'high' | 'medium';

export interface AtRiskAlert {
  studentId: string;
  studentName: string;
  flagEmoji: string;
  riskType: RiskType;
  urgency: RiskUrgency;
  description: string;
  suggestedAction: string;
}

export const getAtRiskAlerts = (): AtRiskAlert[] => {
  const alerts: AtRiskAlert[] = [];
  const now = Date.now();

  DUMMY_STUDENTS.forEach((s) => {
    const name = `${s.personal.firstName} ${s.personal.lastName}`;
    const emoji = s.personal.flagEmoji;

    // Low profile completion
    if (s.profile.completionPct < 70) {
      alerts.push({
        studentId: s.id, studentName: name, flagEmoji: emoji,
        riskType: 'low_completion',
        urgency: s.profile.completionPct < 50 ? 'critical' : 'high',
        description: `Profile only ${s.profile.completionPct}% complete — missing sections limit match quality.`,
        suggestedAction: 'Schedule a session to complete their profile together.',
      });
    }

    // Stalled applications (last active > 14 days ago)
    const daysSinceActive = Math.round((now - new Date(s.lastActive).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceActive > 14 && s.applications.some((a) => a.status === 'planning' || a.status === 'in_progress')) {
      alerts.push({
        studentId: s.id, studentName: name, flagEmoji: emoji,
        riskType: 'stalled_application',
        urgency: daysSinceActive > 30 ? 'critical' : 'high',
        description: `No activity for ${daysSinceActive} days with ${s.applications.filter((a) => a.status !== 'submitted' && a.status !== 'decision').length} incomplete application(s).`,
        suggestedAction: 'Send a check-in message or schedule a meeting.',
      });
    }

    // Deadline approaching with planning-stage application
    s.deadlines.forEach((dl) => {
      const daysUntil = Math.round((new Date(dl.date).getTime() - now) / (1000 * 60 * 60 * 24));
      const matchingApp = s.applications.find((a) => a.university === dl.university);
      if (daysUntil > 0 && daysUntil <= 14 && matchingApp && matchingApp.status === 'planning') {
        alerts.push({
          studentId: s.id, studentName: name, flagEmoji: emoji,
          riskType: 'deadline_approaching',
          urgency: daysUntil <= 5 ? 'critical' : 'high',
          description: `${dl.university} deadline in ${daysUntil} days but application is still in planning stage.`,
          suggestedAction: 'Prioritise this application immediately.',
        });
      }
    });

    // Flagged students
    if (s.flags.includes('deadline_urgent')) {
      const existing = alerts.find((a) => a.studentId === s.id && a.riskType === 'deadline_approaching');
      if (!existing) {
        alerts.push({
          studentId: s.id, studentName: name, flagEmoji: emoji,
          riskType: 'deadline_approaching',
          urgency: 'critical',
          description: 'Flagged as having an urgent deadline.',
          suggestedAction: 'Review deadlines and ensure all materials are ready.',
        });
      }
    }

    if (s.flags.includes('no_matches') && s.matches.length === 0) {
      alerts.push({
        studentId: s.id, studentName: name, flagEmoji: emoji,
        riskType: 'missing_documents',
        urgency: 'medium',
        description: 'No university matches generated — profile may need more detail.',
        suggestedAction: 'Run match generation and review shortlist.',
      });
    }
  });

  // Sort by urgency
  const urgencyOrder: Record<RiskUrgency, number> = { critical: 0, high: 1, medium: 2 };
  return alerts.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
};

// ─── Multi-Country Application View ─────────────────────────────────────────

export interface EnrichedApplication {
  studentId: string;
  studentName: string;
  flagEmoji: string;
  university: string;
  program: string;
  status: ApplicationStatus;
  deadline: string;
  platform: ApplicationPlatform;
  country: string;
}

export const getAllApplicationsWithPlatform = (): EnrichedApplication[] => {
  const apps: EnrichedApplication[] = [];
  DUMMY_STUDENTS.forEach((s) => {
    const name = `${s.personal.firstName} ${s.personal.lastName}`;
    s.applications.forEach((app) => {
      apps.push({
        studentId: s.id,
        studentName: name,
        flagEmoji: s.personal.flagEmoji,
        university: app.university,
        program: app.program,
        status: app.status,
        deadline: app.deadline,
        platform: app.platform ?? inferPlatform(app.university),
        country: app.country ?? inferCountry(app.university),
      });
    });
  });
  return apps;
};

// ─── Parent Communication ───────────────────────────────────────────────────

export interface ParentContact {
  id: string;
  studentId: string;
  studentName: string;
  flagEmoji: string;
  parentName: string;
  relationship: 'Mother' | 'Father' | 'Guardian';
  email: string;
  phone: string;
  lastContacted: string;
  status: 'active' | 'needs-response' | 'resolved';
}

export interface ParentMessage {
  id: string;
  parentContactId: string;
  studentId: string;
  sender: 'counsellor' | 'parent';
  content: string;
  date: string;
  read: boolean;
  template: string | null;
}

export const DUMMY_PARENT_CONTACTS: ParentContact[] = [
  { id: 'pc-1', studentId: 'student-1', studentName: 'Aarav Sharma', flagEmoji: '🇮🇳', parentName: 'Priya Sharma', relationship: 'Mother', email: 'priya.sharma@email.com', phone: '+91 98765 43210', lastContacted: relDate(-3), status: 'active' },
  { id: 'pc-2', studentId: 'student-2', studentName: 'Sofia Müller', flagEmoji: '🇩🇪', parentName: 'Klaus Müller', relationship: 'Father', email: 'klaus.mueller@email.de', phone: '+49 151 2345 6789', lastContacted: relDate(-7), status: 'needs-response' },
  { id: 'pc-3', studentId: 'student-3', studentName: 'Liam O\'Brien', flagEmoji: '🇮🇪', parentName: 'Siobhan O\'Brien', relationship: 'Mother', email: 'siobhan.obrien@email.ie', phone: '+353 87 123 4567', lastContacted: relDate(-14), status: 'needs-response' },
  { id: 'pc-4', studentId: 'student-4', studentName: 'Yuki Tanaka', flagEmoji: '🇯🇵', parentName: 'Takeshi Tanaka', relationship: 'Father', email: 'takeshi.tanaka@email.jp', phone: '+81 90 1234 5678', lastContacted: relDate(-2), status: 'active' },
  { id: 'pc-5', studentId: 'student-5', studentName: 'Amara Okafor', flagEmoji: '🇳🇬', parentName: 'Chioma Okafor', relationship: 'Mother', email: 'chioma.okafor@email.ng', phone: '+234 803 456 7890', lastContacted: relDate(-5), status: 'resolved' },
  { id: 'pc-6', studentId: 'student-6', studentName: 'Chen Wei', flagEmoji: '🇨🇳', parentName: 'Chen Mei', relationship: 'Mother', email: 'chen.mei@email.cn', phone: '+86 138 1234 5678', lastContacted: relDate(-1), status: 'active' },
  { id: 'pc-7', studentId: 'student-7', studentName: 'Isabella Rossi', flagEmoji: '🇮🇹', parentName: 'Marco Rossi', relationship: 'Father', email: 'marco.rossi@email.it', phone: '+39 333 456 7890', lastContacted: relDate(-21), status: 'needs-response' },
  { id: 'pc-8', studentId: 'student-8', studentName: 'Fatima Al-Hassan', flagEmoji: '🇦🇪', parentName: 'Ahmed Al-Hassan', relationship: 'Father', email: 'ahmed.alhassan@email.ae', phone: '+971 50 123 4567', lastContacted: relDate(-4), status: 'active' },
  { id: 'pc-9', studentId: 'student-9', studentName: 'Carlos Silva', flagEmoji: '🇧🇷', parentName: 'Maria Silva', relationship: 'Mother', email: 'maria.silva@email.br', phone: '+55 11 98765 4321', lastContacted: relDate(-10), status: 'resolved' },
  { id: 'pc-10', studentId: 'student-10', studentName: 'Anika Patel', flagEmoji: '🇮🇳', parentName: 'Rajesh Patel', relationship: 'Father', email: 'rajesh.patel@email.in', phone: '+91 99876 54321', lastContacted: relDate(-6), status: 'active' },
];

export const DUMMY_PARENT_MESSAGES: ParentMessage[] = [
  // Priya Sharma (student-1)
  { id: 'pm-1', parentContactId: 'pc-1', studentId: 'student-1', sender: 'counsellor', content: 'Hi Priya, just wanted to update you on Aarav\'s application progress. He\'s submitted to UCL and is working on his Imperial application. Everything is on track.', date: relDate(-7), read: true, template: 'progress_update' },
  { id: 'pm-2', parentContactId: 'pc-1', studentId: 'student-1', sender: 'parent', content: 'Thank you for the update! We\'re a bit worried about the Edinburgh deadline — has he started on that one?', date: relDate(-6), read: true, template: null },
  { id: 'pm-3', parentContactId: 'pc-1', studentId: 'student-1', sender: 'counsellor', content: 'Good question — the Edinburgh application is in planning stage. I\'ll make sure he prioritises it this week. Will update you by Friday.', date: relDate(-3), read: true, template: null },
  // Klaus Müller (student-2)
  { id: 'pm-4', parentContactId: 'pc-2', studentId: 'student-2', sender: 'counsellor', content: 'Dear Mr. Müller, Sofia has submitted all four of her UCAS applications on time. We\'re now waiting for decisions. I\'ll keep you posted on any updates.', date: relDate(-14), read: true, template: 'progress_update' },
  { id: 'pm-5', parentContactId: 'pc-2', studentId: 'student-2', sender: 'parent', content: 'Thank you. Has she heard back from Oxford yet? We\'re anxious to know.', date: relDate(-7), read: true, template: null },
  // Siobhan O'Brien (student-3)
  { id: 'pm-6', parentContactId: 'pc-3', studentId: 'student-3', sender: 'counsellor', content: 'Hi Siobhan, I wanted to flag that Liam\'s Imperial application deadline is approaching but he hasn\'t progressed beyond the planning stage. Could we schedule a call to discuss how to support him?', date: relDate(-14), read: true, template: 'deadline_reminder' },
  // Takeshi Tanaka (student-4)
  { id: 'pm-7', parentContactId: 'pc-4', studentId: 'student-4', sender: 'parent', content: 'Hello, Yuki mentioned she is preparing for her UCAT. Is she on track for the January deadline?', date: relDate(-5), read: true, template: null },
  { id: 'pm-8', parentContactId: 'pc-4', studentId: 'student-4', sender: 'counsellor', content: 'Yes, Yuki is well prepared. She scored well in her practice tests and the UCAT is booked. Her medical school applications are all submitted. Very strong candidate.', date: relDate(-2), read: true, template: null },
  // Chioma Okafor (student-5)
  { id: 'pm-9', parentContactId: 'pc-5', studentId: 'student-5', sender: 'counsellor', content: 'Hi Chioma, great news — Amara has received an offer from Cambridge for Mathematics! She also has offers from Oxford and Bristol. We should discuss her decision soon.', date: relDate(-5), read: true, template: null },
  { id: 'pm-10', parentContactId: 'pc-5', studentId: 'student-5', sender: 'parent', content: 'That is wonderful news! We are so proud. Can we schedule a meeting to discuss which offer to accept?', date: relDate(-5), read: true, template: null },
  // Chen Mei (student-6)
  { id: 'pm-11', parentContactId: 'pc-6', studentId: 'student-6', sender: 'counsellor', content: 'Dear Mrs. Chen, Wei has been inactive on the platform for a few weeks. I know he\'s been focused on the LNAT preparation. Just wanted to check in — is everything okay at home?', date: relDate(-3), read: true, template: null },
  { id: 'pm-12', parentContactId: 'pc-6', studentId: 'student-6', sender: 'parent', content: 'Thank you for checking. Wei has been stressed about the exam. We\'ll encourage him to get back on track with his applications.', date: relDate(-1), read: true, template: null },
  // Marco Rossi (student-7)
  { id: 'pm-13', parentContactId: 'pc-7', studentId: 'student-7', sender: 'counsellor', content: 'Hi Marco, I wanted to remind you that Isabella\'s portfolio submission deadline for UAL is in 2 weeks. She needs to finalise her portfolio by then. Could you help ensure she has time to work on it?', date: relDate(-21), read: true, template: 'deadline_reminder' },
  // Ahmed Al-Hassan (student-8)
  { id: 'pm-14', parentContactId: 'pc-8', studentId: 'student-8', sender: 'parent', content: 'Hello, Fatima wants to study in London specifically. Are there other options besides LSE and Warwick that you would recommend?', date: relDate(-6), read: true, template: null },
  { id: 'pm-15', parentContactId: 'pc-8', studentId: 'student-8', sender: 'counsellor', content: 'Great question! For Economics in London, she could also consider King\'s College London or SOAS. I\'ll send her some programme details this week. Warwick isn\'t in London but has excellent placement rates.', date: relDate(-4), read: true, template: null },
];

export const getParentContacts = (): ParentContact[] =>
  DUMMY_PARENT_CONTACTS.sort((a, b) => {
    const order = { 'needs-response': 0, active: 1, resolved: 2 };
    return order[a.status] - order[b.status];
  });

export const getParentMessages = (contactId: string): ParentMessage[] =>
  DUMMY_PARENT_MESSAGES
    .filter((m) => m.parentContactId === contactId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
