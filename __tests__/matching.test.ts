import { rankMatches, scoreMatch } from '@/lib/matching/engine';
import type { MatchInput } from '@/lib/matching/engine';

const baseStudent = {
  academics: {
    curriculum: 'IB',
    gpa: 3.8,
    ib_total: 38,
    sat: 1420,
    act: 30,
    toefl: 105,
    ielts: 7,
    subject_grades: [
      { subject: 'Mathematics HL', level: 'HL', score: '6' },
      { subject: 'Physics HL', level: 'HL', score: '6' }
    ]
  },
  preferences: {
    budget_min: 20000,
    budget_max: 45000,
    countries: ['United States', 'Canada'],
    languages: ['English'],
    program_levels: ['Undergraduate'],
    delivery: 'On-campus'
  },
  aspirations: {
    target_fields: ['Computer Science'],
    job_titles: ['Software Engineer']
  }
};

const programA = {
  id: 'program-a',
  name: 'BSc Computer Science',
  field: 'Computer Science',
  level: 'Undergraduate',
  language: 'English',
  mode: 'On-campus',
  tuition: 42000
};

const universityA = {
  id: 'univ-a',
  name: 'Global Tech University',
  country: 'United States',
  rank_overall: 50,
  acceptance_rate: 0.25,
  requires_test: true
};

const requirementA = {
  program_id: 'program-a',
  curriculum: 'IB',
  min_gpa: 3.4,
  min_sat: 1350,
  required_subjects: ['Mathematics HL'],
  language_tests: { toefl: 90 }
};

const programB = {
  id: 'program-b',
  name: 'BSc Data Science',
  field: 'Data Science',
  level: 'Undergraduate',
  language: 'English',
  mode: 'On-campus',
  tuition: 52000
};

const universityB = {
  id: 'univ-b',
  name: 'Northern Analytics College',
  country: 'Canada',
  rank_overall: 120,
  acceptance_rate: 0.5,
  requires_test: false
};

const requirementB = {
  program_id: 'program-b',
  curriculum: 'IB',
  min_gpa: 3.7,
  min_sat: 1400,
  required_subjects: ['Mathematics HL', 'Statistics HL'],
  language_tests: { toefl: 95 }
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
