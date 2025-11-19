import { defaultWeights, type MatchingWeights, OUTCOME_RANKING_BENCHMARK } from './config';

export type StudentAcademics = {
  curriculum?: string | null;
  gpa?: number | null;
  ib_total?: number | null;
  sat?: number | null;
  act?: number | null;
  toefl?: number | null;
  ielts?: number | null;
  subject_grades?: { subject: string; level: string; score: string }[] | null;
};

export type StudentPreferences = {
  budget_min?: number | null;
  budget_max?: number | null;
  aid_needed?: boolean | null;
  countries?: string[] | null;
  languages?: string[] | null;
  campus_type?: string | null;
  setting?: string | null;
  size?: string | null;
  program_levels?: string[] | null;
  delivery?: string | null;
};

export type StudentAspirations = {
  target_fields?: string[] | null;
  job_titles?: string[] | null;
};

export type Program = {
  id: string;
  name: string;
  field?: string | null;
  level?: string | null;
  duration_years?: number | null;
  language?: string | null;
  mode?: string | null;
  intake_months?: string[] | null;
  tuition?: number | null;
  currency?: string | null;
  url?: string | null;
};

export type University = {
  id: string;
  name: string;
  country: string;
  region?: string | null;
  rank_overall?: number | null;
  rank_source?: string | null;
  acceptance_rate?: number | null;
  requires_test?: boolean | null;
};

export type ProgramRequirement = {
  program_id: string;
  curriculum?: string | null;
  min_gpa?: number | null;
  min_ib_total?: number | null;
  min_sat?: number | null;
  min_act?: number | null;
  required_subjects?: string[] | null;
  language_tests?: Record<string, number> | null;
  other_requirements?: string | null;
};

export type MatchInput = {
  academics: StudentAcademics;
  preferences: StudentPreferences;
  aspirations: StudentAspirations;
  program: Program;
  university: University;
  requirement?: ProgramRequirement | null;
};

export type MatchBreakdown = {
  eligibility: number;
  academicFit: number;
  preferenceFit: number;
  outcomes: number;
};

export type MatchTier = 'Reach' | 'Match' | 'Safe';

export type MatchResult = {
  programId: string;
  universityId: string;
  score: number;
  breakdown: MatchBreakdown;
  blockingReasons: string[];
  tier: MatchTier;
};

const clampScore = (value: number) => Math.max(0, Math.min(100, value));

const calculateEligibility = (input: MatchInput) => {
  const reasons: string[] = [];
  const { academics, requirement } = input;

  if (!requirement) {
    return { score: 100, reasons };
  }

  if (requirement.curriculum && academics.curriculum && requirement.curriculum !== academics.curriculum) {
    reasons.push(`Program requires ${requirement.curriculum} curriculum`);
  }

  if (requirement.min_gpa && (academics.gpa ?? 0) < requirement.min_gpa) {
    reasons.push(`Minimum GPA ${requirement.min_gpa}`);
  }

  if (requirement.min_ib_total && (academics.ib_total ?? 0) < requirement.min_ib_total) {
    reasons.push(`Minimum IB total ${requirement.min_ib_total}`);
  }

  if (requirement.min_sat && (academics.sat ?? 0) < requirement.min_sat) {
    reasons.push(`Minimum SAT ${requirement.min_sat}`);
  }

  if (requirement.min_act && (academics.act ?? 0) < requirement.min_act) {
    reasons.push(`Minimum ACT ${requirement.min_act}`);
  }

  if (requirement.required_subjects && requirement.required_subjects.length > 0) {
    const subjects = (academics.subject_grades ?? []).map((entry) => entry.subject.toLowerCase());
    const missing = requirement.required_subjects.filter((subject) => !subjects.includes(subject.toLowerCase()));
    if (missing.length > 0) {
      reasons.push(`Missing required subjects: ${missing.join(', ')}`);
    }
  }

  if (requirement.language_tests) {
    if (requirement.language_tests.ielts && (academics.ielts ?? 0) < requirement.language_tests.ielts) {
      reasons.push(`IELTS minimum ${requirement.language_tests.ielts}`);
    }
    if (requirement.language_tests.toefl && (academics.toefl ?? 0) < requirement.language_tests.toefl) {
      reasons.push(`TOEFL minimum ${requirement.language_tests.toefl}`);
    }
  }

  const score = reasons.length === 0 ? 100 : 40;
  return { score, reasons };
};

const calculateAcademicFit = (input: MatchInput) => {
  const { academics, requirement } = input;
  if (!requirement) return 70;

  const ratios: number[] = [];

  if (requirement.min_gpa && academics.gpa) {
    ratios.push((academics.gpa - requirement.min_gpa + 4) / 4);
  }

  if (requirement.min_ib_total && academics.ib_total) {
    ratios.push((academics.ib_total - requirement.min_ib_total + 45) / 45);
  }

  if (requirement.min_sat && academics.sat) {
    ratios.push((academics.sat - requirement.min_sat + 1600) / 1600);
  }

  if (requirement.min_act && academics.act) {
    ratios.push((academics.act - requirement.min_act + 36) / 36);
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

  if (preferences.program_levels && preferences.program_levels.length > 0 && program.level) {
    scores.push(jaccard(preferences.program_levels, [program.level]));
  }

  if (preferences.delivery && program.mode) {
    scores.push(program.mode.toLowerCase() === preferences.delivery.toLowerCase() ? 1 : 0.5);
  }

  if (typeof preferences.budget_max === 'number' && program.tuition) {
    const withinBudget = program.tuition <= preferences.budget_max;
    const penalty = withinBudget ? 1 : Math.max(0, 1 - (program.tuition - preferences.budget_max) / (preferences.budget_max || 1));
    scores.push(penalty);
  }

  if (scores.length === 0) return 60;

  return clampScore((scores.reduce((total, value) => total + value, 0) / scores.length) * 100);
};

const calculateOutcomeSignal = (input: MatchInput) => {
  const { university, program, aspirations } = input;
  const scores: number[] = [];

  if (university.rank_overall) {
    const rankScore = Math.max(0, 1 - (university.rank_overall - 1) / OUTCOME_RANKING_BENCHMARK);
    scores.push(rankScore);
  }

  if (typeof university.acceptance_rate === 'number') {
    const acceptance = university.acceptance_rate;
    const acceptanceScore = acceptance > 0 ? clampScore((1 - acceptance) * 100) / 100 : 0.5;
    scores.push(acceptanceScore);
  }

  if (program.field && aspirations.target_fields && aspirations.target_fields.length > 0) {
    scores.push(jaccard(aspirations.target_fields, [program.field]));
  }

  if (university.requires_test === false) {
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

export const scoreMatch = (input: MatchInput, weights: MatchingWeights = defaultWeights): MatchResult => {
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
    typeof university.rank_overall === 'number' && university.rank_overall > 0 ? university.rank_overall : undefined;
  const rankScore = rank ? Math.max(0, 1 - (rank - 1) / 500) : 0.4;
  const acceptanceScore =
    typeof university.acceptance_rate === 'number' ? Math.max(0, Math.min(1, 1 - university.acceptance_rate)) : 0.4;
  return (rankScore + acceptanceScore) / 2;
};

const determineMatchTier = (input: MatchInput, score: number): MatchTier => {
  const prestige = describePrestige(input.university);
  const combinedScore = Math.max(0, Math.min(1, (score / 100) * 0.6 + prestige * 0.4));

  if (combinedScore >= 0.75) return 'Reach';
  if (combinedScore >= 0.5) return 'Match';
  return 'Safe';
};
