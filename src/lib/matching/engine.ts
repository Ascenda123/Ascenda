import { defaultWeights, type MatchingWeights, OUTCOME_RANKING_BENCHMARK } from './config';
import type { MatchTier } from './match-tier';

export type StudentAcademics = {
  curriculum?: string | null;
  gpa?: number | null;
  ibTotal?: number | null;
  sat?: number | null;
  act?: number | null;
  toefl?: number | null;
  ielts?: number | null;
  subjectGrades?: { subject: string; level: string; score: string }[] | null;
};

export type StudentPreferences = {
  budgetMin?: number | null;
  budgetMax?: number | null;
  aidNeeded?: boolean | null;
  countries?: string[] | null;
  languages?: string[] | null;
  campusType?: string | null;
  setting?: string | null;
  size?: string | null;
  programLevels?: string[] | null;
  delivery?: string | null;
};

export type StudentAspirations = {
  targetFields?: string[] | null;
  jobTitles?: string[] | null;
};

export type Program = {
  id: string;
  name: string;
  field?: string | null;
  level?: string | null;
  durationYears?: number | null;
  language?: string | null;
  mode?: string | null;
  intakeMonths?: string[] | null;
  tuition?: number | null;
  currency?: string | null;
  url?: string | null;
  universityId: string;
};

export type University = {
  id: string;
  name: string;
  country: string;
  region?: string | null;
  rankOverall?: number | null;
  rankSource?: string | null;
  acceptanceRate?: number | null;
  requiresTest?: boolean | null;
};

export type ProgramRequirement = {
  programId: string;
  curriculum?: string | null;
  minGpa?: number | null;
  minIbTotal?: number | null;
  minSat?: number | null;
  minAct?: number | null;
  requiredSubjects?: string[] | null;
  languageTests?: Record<string, number> | null;
  otherRequirements?: string | null;
};

export type MatchInput = {
  academics: StudentAcademics;
  preferences: StudentPreferences;
  aspirations: StudentAspirations;
  program: Program;
  university: University;
  requirement?: ProgramRequirement;
  weights?: MatchingWeights;
};

export type MatchBreakdown = {
  eligibility: number;
  academicFit: number;
  preferenceFit: number;
  outcomes: number;
};

export type MatchResult = {
  programId: string;
  universityId: string;
  score: number;
  breakdown: MatchBreakdown;
  blockingReasons: string[];
  tier: MatchTier;
};

const clampScore = (value: number) => Math.max(0, Math.min(100, value));

const normalizeAcceptanceRate = (value?: number | string | null) => {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : value;
  if (!Number.isFinite(parsed)) return null;
  const ratio = parsed > 1 ? parsed / 100 : parsed;
  if (ratio < 0) return null;
  return Math.min(1, ratio);
};

const calculateEligibility = (input: MatchInput) => {
  const reasons: string[] = [];
  const { academics, requirement } = input;

  if (!requirement) {
    return { score: 100, reasons };
  }

  if (requirement.curriculum && academics.curriculum && requirement.curriculum !== academics.curriculum) {
    reasons.push(`Program requires ${requirement.curriculum} curriculum`);
  }

  if (requirement.minGpa && (academics.gpa ?? 0) < requirement.minGpa) {
    reasons.push(`Minimum GPA ${requirement.minGpa}`);
  }

  if (requirement.minIbTotal && (academics.ibTotal ?? 0) < requirement.minIbTotal) {
    reasons.push(`Minimum IB total ${requirement.minIbTotal}`);
  }

  if (requirement.minSat && (academics.sat ?? 0) < requirement.minSat) {
    reasons.push(`Minimum SAT ${requirement.minSat}`);
  }

  if (requirement.minAct && (academics.act ?? 0) < requirement.minAct) {
    reasons.push(`Minimum ACT ${requirement.minAct}`);
  }

  if (requirement.requiredSubjects && requirement.requiredSubjects.length > 0 && (academics.subjectGrades?.length ?? 0) > 0) {
    const subjects = (academics.subjectGrades ?? []).map((entry) => entry.subject.toLowerCase());
    const missing = requirement.requiredSubjects.filter((subject) => !subjects.includes(subject.toLowerCase()));
    if (missing.length > 0) {
      reasons.push(`Missing required subjects: ${missing.join(', ')}`);
    }
  }

  if (requirement.languageTests) {
    if (requirement.languageTests.ielts && (academics.ielts ?? 0) < requirement.languageTests.ielts) {
      reasons.push(`IELTS minimum ${requirement.languageTests.ielts}`);
    }
    if (requirement.languageTests.toefl && (academics.toefl ?? 0) < requirement.languageTests.toefl) {
      reasons.push(`TOEFL minimum ${requirement.languageTests.toefl}`);
    }
  }

  const score = reasons.length === 0 ? 100 : 40;
  return { score, reasons };
};

const calculateAcademicFit = (input: MatchInput) => {
  const { academics, requirement } = input;
  if (!requirement) return 70;

  const ratios: number[] = [];

  if (requirement.minGpa && academics.gpa) {
    ratios.push((academics.gpa - requirement.minGpa + 4) / 4);
  }

  if (requirement.minIbTotal && academics.ibTotal) {
    ratios.push((academics.ibTotal - requirement.minIbTotal + 45) / 45);
  }

  if (requirement.minSat && academics.sat) {
    ratios.push((academics.sat - requirement.minSat + 1600) / 1600);
  }

  if (requirement.minAct && academics.act) {
    ratios.push((academics.act - requirement.minAct + 36) / 36);
  }

  if (ratios.length === 0) return 70;

  const avg = ratios.reduce((total, value) => total + value, 0) / ratios.length;
  return clampScore(avg * 100);
};

const jaccard = (a: string[] = [], b: string[] = []) => {
  if (!a.length && !b.length) return 1;
  const setA = new Set(a.map((item) => item.toLowerCase()));
  const setB = new Set(b.map((item) => item.toLowerCase()));
  const intersection = Array.from(setA).filter((item) => setB.has(item));
  const union = new Set([...setA, ...setB]);
  return intersection.length / union.size;
};

const calculatePreferenceFit = (input: MatchInput) => {
  const { preferences, program, university } = input;
  const scores: number[] = [];

  if (preferences.countries && preferences.countries.length > 0) {
    const inPreferredCountry = preferences.countries.some(
      (country) => country.toLowerCase() === university.country.toLowerCase()
    );
    scores.push(inPreferredCountry ? 1 : 0);
  }

  if (preferences.languages && preferences.languages.length > 0 && program.language) {
    scores.push(jaccard(preferences.languages, [program.language]));
  }

  if (preferences.programLevels && preferences.programLevels.length > 0 && program.level) {
    scores.push(jaccard(preferences.programLevels, [program.level]));
  }

  if (preferences.delivery && program.mode) {
    scores.push(program.mode.toLowerCase() === preferences.delivery.toLowerCase() ? 1 : 0.5);
  }

  if (typeof preferences.budgetMax === 'number' && preferences.budgetMax > 0 && program.tuition) {
    const withinBudget = program.tuition <= preferences.budgetMax;
    const penalty = withinBudget ? 1 : Math.max(0, 1 - (program.tuition - preferences.budgetMax) / preferences.budgetMax);
    scores.push(penalty);
  }

  if (scores.length === 0) return 60;

  return clampScore((scores.reduce((total, value) => total + value, 0) / scores.length) * 100);
};

const calculateOutcomeSignal = (input: MatchInput) => {
  const { university, program, aspirations } = input;
  const scores: number[] = [];

  if (university.rankOverall) {
    const rankScore = Math.max(0, 1 - (university.rankOverall - 1) / OUTCOME_RANKING_BENCHMARK);
    scores.push(rankScore);
  }

  const acceptanceRate = normalizeAcceptanceRate(university.acceptanceRate);
  if (acceptanceRate !== null) {
    const acceptanceScore = 1 - acceptanceRate;
    scores.push(Math.max(0, Math.min(1, acceptanceScore)));
  }

  if (program.field && aspirations.targetFields && aspirations.targetFields.length > 0) {
    scores.push(jaccard(aspirations.targetFields, [program.field]));
  }

  if (university.requiresTest === false) {
    scores.push(0.6);
  }

  if (scores.length === 0) return 55;
  return clampScore((scores.reduce((total, value) => total + value, 0) / scores.length) * 100);
};

export const combineScore = (breakdown: MatchBreakdown, weights: MatchingWeights = defaultWeights) => {
  const total =
    breakdown.eligibility * weights.eligibility +
    breakdown.academicFit * weights.academicFit +
    breakdown.preferenceFit * weights.preferenceFit +
    breakdown.outcomes * weights.outcomes;
  return Math.round(total / (weights.eligibility + weights.academicFit + weights.preferenceFit + weights.outcomes));
};

export const scoreMatch = (input: MatchInput, weightsArg: MatchingWeights = defaultWeights): MatchResult => {
  const weights = input.weights || weightsArg;
  const eligibility = calculateEligibility(input);
  const academicFit = calculateAcademicFit(input);
  const preferenceFit = calculatePreferenceFit(input);
  const outcomes = calculateOutcomeSignal(input);

  const breakdown: MatchBreakdown = {
    eligibility: eligibility.score,
    academicFit,
    preferenceFit,
    outcomes
  };

  let score = combineScore(breakdown, weights);
  if (eligibility.reasons.length > 0) {
    score = Math.min(score, 40);
  }

  const tier = determineMatchTier(input, score);

  return {
    programId: input.program.id,
    universityId: input.university.id,
    score,
    breakdown,
    blockingReasons: eligibility.reasons,
    tier
  };
};

export const rankMatches = (inputs: MatchInput[], weights: MatchingWeights = defaultWeights): MatchResult[] => {
  return inputs
    .map((input) => scoreMatch(input, weights))
    .sort((a, b) => b.score - a.score);
};

const describePrestige = (university: University) => {
  const rank =
    typeof university.rankOverall === 'number' && university.rankOverall > 0 ? university.rankOverall : undefined;
  const rankScore = rank ? Math.max(0, 1 - (rank - 1) / 500) : 0.4;
  const acceptanceRate = normalizeAcceptanceRate(university.acceptanceRate);
  const acceptanceScore = acceptanceRate !== null ? Math.max(0, Math.min(1, 1 - acceptanceRate)) : 0.4;
  return (rankScore + acceptanceScore) / 2;
};

const determineMatchTier = (input: MatchInput, score: number): MatchTier => {
  const prestige = describePrestige(input.university);
  const combinedScore = Math.max(0, Math.min(1, (score / 100) * 0.6 + prestige * 0.4));

  if (combinedScore >= 0.75) return 'Safe';
  if (combinedScore >= 0.5) return 'Match';
  return 'Reach';
};
