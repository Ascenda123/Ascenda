import { rankMatches, type MatchInput } from '@/lib/matching/engine';
import { defaultWeights } from '@/lib/matching/config';

const baseInput = (): MatchInput => ({
  academics: { curriculum: 'IB', gpa: 3.8, ibTotal: 38, sat: 1400, act: 30, toefl: 100, ielts: 7.5, subjectGrades: [] },
  preferences: { budgetMax: 35000, budgetMin: 0, aidNeeded: false, countries: ['United Kingdom'], languages: ['English'], campusType: null, setting: null, size: null, programLevels: ['Undergraduate'], delivery: 'in_person' },
  aspirations: { targetFields: ['Computer Science'], jobTitles: ['Engineer'] },
  program: {
    id: 'program-1',
    name: 'Computer Science BSc',
    field: 'Computer Science',
    level: 'Undergraduate',
    durationYears: 3,
    language: 'English',
    mode: 'In-person',
    intakeMonths: ['Sep'],
    tuition: 30000,
    currency: 'GBP',
    url: null,
    universityId: 'uni-1'
  },
  university: {
    id: 'uni-1',
    name: 'Example University',
    country: 'United Kingdom',
    region: 'England',
    rankOverall: 120,
    rankSource: 'QS',
    acceptanceRate: 0.18,
    requiresTest: false
  },
  requirement: {
    programId: 'program-1',
    curriculum: 'IB',
    minGpa: 3.0,
    minIbTotal: 34,
    minSat: 1250,
    minAct: 28,
    requiredSubjects: ['Math'],
    languageTests: { toefl: 90 },
    otherRequirements: null
  },
  weights: defaultWeights
});

const buildInput = (overrides: Partial<MatchInput>): MatchInput => ({
  ...baseInput(),
  ...overrides,
  academics: { ...baseInput().academics, ...overrides.academics },
  preferences: { ...baseInput().preferences, ...overrides.preferences },
  aspirations: { ...baseInput().aspirations, ...overrides.aspirations },
  program: { ...baseInput().program, ...overrides.program },
  university: { ...baseInput().university, ...overrides.university },
  requirement: overrides.requirement ?? baseInput().requirement,
  weights: overrides.weights ?? baseInput().weights
});

describe('matching engine', () => {
  it('ranks higher-scoring programs first', () => {
    const goodMatch = buildInput({});
    const weakerMatch = buildInput({
      program: { ...baseInput().program, id: 'program-2', name: 'Art BA', universityId: 'uni-2', field: 'Art', tuition: 60000 },
      university: { ...baseInput().university, id: 'uni-2', name: 'Fallback University', acceptanceRate: 0.4, rankOverall: 500 },
      requirement: { ...baseInput().requirement!, programId: 'program-2', minIbTotal: 40 }
    });

    const ranked = rankMatches([weakerMatch, goodMatch], defaultWeights);

    expect(ranked[0].programId).toBe('program-1');
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  it('caps score when eligibility blockers exist', () => {
    const blocked = buildInput({
      requirement: { ...baseInput().requirement!, minIbTotal: 45 },
      academics: { ...baseInput().academics, ibTotal: 30 }
    });

    const ranked = rankMatches([blocked], defaultWeights);

    expect(ranked[0].score).toBeLessThanOrEqual(40);
    expect(ranked[0].blockingReasons.length).toBeGreaterThan(0);
  });
});
