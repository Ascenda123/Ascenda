import { rankMatches, scoreMatch } from '@/lib/matching/engine';
import type { MatchInput } from '@/lib/matching/engine';

const baseStudent = {
  academics: {
    curriculum: 'IB',
    gpa: 3.8,
    ibTotal: 38,
    sat: 1420,
    act: 30,
    toefl: 105,
    ielts: 7,
    subjectGrades: [
      { subject: 'Mathematics HL', level: 'HL', score: '6' },
      { subject: 'Physics HL', level: 'HL', score: '6' }
    ]
  },
  preferences: {
    budgetMin: 20000,
    budgetMax: 45000,
    countries: ['United States', 'Canada'],
    languages: ['English'],
    programLevels: ['Undergraduate'],
    delivery: 'On-campus'
  },
  aspirations: {
    targetFields: ['Computer Science'],
    jobTitles: ['Software Engineer']
  }
};

const programA = {
  id: 'program-a',
  name: 'BSc Computer Science',
  field: 'Computer Science',
  level: 'Undergraduate',
  language: 'English',
  mode: 'On-campus',
  tuition: 42000,
  universityId: 'univ-a'
};

const universityA = {
  id: 'univ-a',
  name: 'Global Tech University',
  country: 'United States',
  rankOverall: 50,
  acceptanceRate: 0.25,
  requiresTest: true
};

const requirementA = {
  programId: 'program-a',
  curriculum: 'IB',
  minGpa: 3.4,
  minSat: 1350,
  requiredSubjects: ['Mathematics HL'],
  languageTests: { toefl: 90 }
};

const programB = {
  id: 'program-b',
  name: 'BSc Data Science',
  field: 'Data Science',
  level: 'Undergraduate',
  language: 'English',
  mode: 'On-campus',
  tuition: 52000,
  universityId: 'univ-b'
};

const universityB = {
  id: 'univ-b',
  name: 'Northern Analytics College',
  country: 'Canada',
  rankOverall: 120,
  acceptanceRate: 0.5,
  requiresTest: false
};

const requirementB = {
  programId: 'program-b',
  curriculum: 'IB',
  minGpa: 3.7,
  minSat: 1400,
  requiredSubjects: ['Mathematics HL', 'Statistics HL'],
  languageTests: { toefl: 95 }
};

describe('matching engine', () => {
  it('calculates high score when student exceeds requirements', () => {
    const input: MatchInput = {
      ...baseStudent,
      program: programA,
      university: universityA,
      requirement: requirementA
    };

    const result = scoreMatch(input);
    expect(result.score).toBeGreaterThan(70);
    expect(result.breakdown.eligibility).toBe(100);
    expect(result.blockingReasons).toHaveLength(0);
  });

  it('penalizes missing hard requirements', () => {
    const input: MatchInput = {
      ...baseStudent,
      academics: { ...baseStudent.academics, sat: 1200 },
      program: programB,
      university: universityB,
      requirement: requirementB
    };

    const result = scoreMatch(input);
    expect(result.score).toBeLessThanOrEqual(40);
    expect(result.blockingReasons.length).toBeGreaterThan(0);
  });

  it('ranks matches by score', () => {
    const inputs: MatchInput[] = [
      {
        ...baseStudent,
        program: programA,
        university: universityA,
        requirement: requirementA
      },
      {
        ...baseStudent,
        academics: { ...baseStudent.academics, gpa: 3.2 },
        program: programB,
        university: universityB,
        requirement: requirementB
      }
    ];

    const ranked = rankMatches(inputs);
    expect(ranked[0].programId).toBe('program-a');
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });
});
