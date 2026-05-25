/**
 * Ascenda Scoring Batch Runner
 * ─────────────────────────────
 * Scores every profile in the provided batch and prints a structured report.
 *
 * Usage (ts-node):
 *   npx ts-node -e "require('./dist/__tests__/scoring_validation/batch_runner')"
 *
 * Or as a Jest test: npm test -- batch_runner
 *
 * The report shows, for each profile:
 *  - Score breakdown (each component)
 *  - Activities breakdown (new)
 *  - Band result + delta if activities removed
 *  - Tier-fit against a set of representative real programmes
 */

import { scoreStudentProfile } from '../../src/lib/scoring/student_scoring';
import { rankCourseMatches } from '../../src/lib/matching/matching_engine';
import { ACTIVITIES_WEIGHTS } from '../../src/lib/scoring/activities_scoring';
import type { StudentProfilePayload } from '../../src/lib/profile/intake-types';
import type { EnrichedCourseRecord } from '../../src/lib/tiering/course_tiering';
import { PHASE1_PROFILES } from './phase1_profiles';

// ── Representative programme catalogue ───────────────────────────────────────
// A curated cross-cluster set of real programmes at different tiers.
// Covers Medicine, Law, CS, Engineering, Business across tiers 1-5.

const CATALOGUE: Partial<EnrichedCourseRecord>[] = [
  // Medicine — tier 1
  { university: 'University of Oxford', course: 'Medicine (BM BCh)', ucas_code: 'A100', course_tier: 1, min_ib_score: 39, min_a_level_score: 'A*AA', admission_test: 'UCAT', english_score_requirement: '7.5', total_course_score: 99, university_score: 99, yearly_international_tuition_fee_gbp: 48000 },
  { university: 'Imperial College London', course: 'Medicine (MBBS)', ucas_code: 'A100', course_tier: 1, min_ib_score: 38, min_a_level_score: 'A*AA', admission_test: 'UCAT', english_score_requirement: '7.0', total_course_score: 96, university_score: 97, yearly_international_tuition_fee_gbp: 45000 },
  { university: 'University of Manchester', course: 'Medicine (MBChB)', ucas_code: 'A106', course_tier: 2, min_ib_score: 37, min_a_level_score: 'AAA', admission_test: 'UCAT', english_score_requirement: '7.0', total_course_score: 90, university_score: 90, yearly_international_tuition_fee_gbp: 38000 },
  { university: 'University of Nottingham', course: 'Medicine (BMedSci)', ucas_code: 'A100', course_tier: 3, min_ib_score: 36, min_a_level_score: 'AAA', admission_test: 'UCAT', english_score_requirement: '7.0', total_course_score: 84, university_score: 85, yearly_international_tuition_fee_gbp: 36000 },
  { university: 'University of Plymouth', course: 'Medicine (BMBS)', ucas_code: 'A100', course_tier: 4, min_ib_score: 34, min_a_level_score: 'AAB', admission_test: 'UCAT', english_score_requirement: '7.0', total_course_score: 72, university_score: 75, yearly_international_tuition_fee_gbp: 32000 },

  // Law — tier 1-5
  { university: 'University of Oxford', course: 'Law (Jurisprudence)', ucas_code: 'M100', course_tier: 1, min_ib_score: 40, min_a_level_score: 'A*AA', admission_test: 'LNAT', english_score_requirement: '7.5', total_course_score: 99, university_score: 99, yearly_international_tuition_fee_gbp: 28000 },
  { university: 'UCL', course: 'Law (LLB)', ucas_code: 'M100', course_tier: 1, min_ib_score: 38, min_a_level_score: 'A*AA', admission_test: 'LNAT', english_score_requirement: '7.5', total_course_score: 94, university_score: 96, yearly_international_tuition_fee_gbp: 27000 },
  { university: 'University of Exeter', course: 'Law (LLB)', ucas_code: 'M100', course_tier: 2, min_ib_score: 36, min_a_level_score: 'AAB', admission_test: 'LNAT', english_score_requirement: '7.0', total_course_score: 86, university_score: 88, yearly_international_tuition_fee_gbp: 22000 },
  { university: 'University of York', course: 'Law (LLB)', ucas_code: 'M100', course_tier: 3, min_ib_score: 34, min_a_level_score: 'ABB', admission_test: null, english_score_requirement: '6.5', total_course_score: 80, university_score: 82, yearly_international_tuition_fee_gbp: 20000 },
  { university: 'University of Hertfordshire', course: 'Law (LLB)', ucas_code: 'M100', course_tier: 4, min_ib_score: 28, min_a_level_score: 'BBC', admission_test: null, english_score_requirement: '6.0', total_course_score: 65, university_score: 68, yearly_international_tuition_fee_gbp: 15000 },

  // Computer Science — tier 1-5
  { university: 'University of Cambridge', course: 'Computer Science (BA)', ucas_code: 'G400', course_tier: 1, min_ib_score: 40, min_a_level_score: 'A*A*A', admission_test: null, english_score_requirement: '7.5', total_course_score: 99, university_score: 99, yearly_international_tuition_fee_gbp: 35000 },
  { university: 'University of Edinburgh', course: 'Computer Science (BSc)', ucas_code: 'G400', course_tier: 2, min_ib_score: 37, min_a_level_score: 'AAA', admission_test: null, english_score_requirement: '6.5', total_course_score: 88, university_score: 90, yearly_international_tuition_fee_gbp: 26000 },
  { university: 'University of Bristol', course: 'Computer Science (BSc)', ucas_code: 'G400', course_tier: 2, min_ib_score: 36, min_a_level_score: 'AAB', admission_test: null, english_score_requirement: '6.5', total_course_score: 86, university_score: 87, yearly_international_tuition_fee_gbp: 24000 },
  { university: 'University of Glasgow', course: 'Computing Science (BSc)', ucas_code: 'G400', course_tier: 3, min_ib_score: 34, min_a_level_score: 'ABB', admission_test: null, english_score_requirement: '6.5', total_course_score: 80, university_score: 82, yearly_international_tuition_fee_gbp: 23000 },
  { university: 'Coventry University', course: 'Computer Science (BSc)', ucas_code: 'G400', course_tier: 4, min_ib_score: 28, min_a_level_score: 'BCC', admission_test: null, english_score_requirement: '6.0', total_course_score: 62, university_score: 65, yearly_international_tuition_fee_gbp: 16000 },
  { university: 'University of Wolverhampton', course: 'Computer Science (BSc)', ucas_code: 'G400', course_tier: 5, min_ib_score: 24, min_a_level_score: 'CCC', admission_test: null, english_score_requirement: '6.0', total_course_score: 50, university_score: 55, yearly_international_tuition_fee_gbp: 14000 },

  // Business — tier 1-5
  { university: 'London School of Economics', course: 'Management (BSc)', ucas_code: 'N200', course_tier: 1, min_ib_score: 38, min_a_level_score: 'A*AA', admission_test: null, english_score_requirement: '7.0', total_course_score: 96, university_score: 97, yearly_international_tuition_fee_gbp: 30000 },
  { university: 'University of Warwick', course: 'Business (BSc)', ucas_code: 'N100', course_tier: 1, min_ib_score: 38, min_a_level_score: 'A*AA', admission_test: null, english_score_requirement: '7.0', total_course_score: 93, university_score: 94, yearly_international_tuition_fee_gbp: 28000 },
  { university: 'University of Bath', course: 'Business Administration (BSc)', ucas_code: 'N100', course_tier: 2, min_ib_score: 36, min_a_level_score: 'AAA', admission_test: null, english_score_requirement: '6.5', total_course_score: 88, university_score: 89, yearly_international_tuition_fee_gbp: 25000 },
  { university: 'University of Surrey', course: 'Business Management (BSc)', ucas_code: 'N100', course_tier: 3, min_ib_score: 33, min_a_level_score: 'ABB', admission_test: null, english_score_requirement: '6.5', total_course_score: 79, university_score: 80, yearly_international_tuition_fee_gbp: 21000 },
  { university: 'University of Hertfordshire', course: 'Business Management (BSc)', ucas_code: 'N100', course_tier: 4, min_ib_score: 28, min_a_level_score: 'BBC', admission_test: null, english_score_requirement: '6.0', total_course_score: 63, university_score: 65, yearly_international_tuition_fee_gbp: 15000 },
];

// ── Report helpers ────────────────────────────────────────────────────────────

const BAND_EMOJI: Record<string, string> = {
  'Exceptional': '🏆',
  'Very strong': '⭐',
  'Strong': '✅',
  'Solid': '🟡',
  'Borderline': '🟠',
  'Weak': '🔴',
};

const pad = (s: string, len: number) => s.padEnd(len, ' ').slice(0, len);

function printHeader(label: string) {
  const line = '═'.repeat(80);
  console.log(`\n${line}`);
  console.log(`  ${label}`);
  console.log(line);
}

function printBreakdown(profile: StudentProfilePayload) {
  const result = scoreStudentProfile(profile);
  const b = result.breakdown;
  const emoji = BAND_EMOJI[result.student_band] ?? '❓';

  // Score without activities (for delta comparison)
  const withoutActivities = result.total_score - b.activities.total;

  console.log(`\n  Band: ${emoji} ${result.student_band}   (score: ${result.total_score}/200)`);
  console.log(`  Activities added: +${b.activities.total} pts  (base without activities: ${withoutActivities})`);
  console.log(`\n  Score breakdown:`);
  console.log(`    Academic performance .......... ${b.academic_performance}`);
  console.log(`    IB HL strength ................ ${b.ib_hl_strength}`);
  console.log(`    Preferred subject alignment ... ${b.preferred_subjects_alignment}`);
  console.log(`    Key subject grades ............ ${b.key_subject_grades}`);
  console.log(`    Subject rigour ................ ${b.rigour_score}`);
  console.log(`    EE relevance bonus ............ ${b.ee_relevance_bonus}`);
  console.log(`    Tests & English ............... ${b.tests_and_english}`);
  console.log(`    ─────────────────────────────── ──`);
  console.log(`    Activities total .............. +${b.activities.total}`);
  console.log(`      └ commitment (${profile.lifestyle_preference.commitment_level ?? 'none'}) .. ${b.activities.commitment}`);
  console.log(`      └ leadership ................ ${b.activities.leadership}`);
  console.log(`      └ key activities (${(profile.lifestyle_preference.key_activities ?? []).length}) .... ${b.activities.key_activities}`);
  console.log(`      └ intl experience ........... ${b.activities.intl_experience}`);
  console.log(`      └ work experience ........... ${b.activities.work_experience}`);

  if (result.eligibility_flags.length > 0)
    console.log(`\n  ⚠ Eligibility flags: ${result.eligibility_flags.join(', ')}`);
  if (result.readiness_flags.length > 0)
    console.log(`  ⚠ Readiness flags:   ${result.readiness_flags.join(', ')}`);

  return result;
}

function printMatches(profile: StudentProfilePayload, result: ReturnType<typeof scoreStudentProfile>) {
  const matches = rankCourseMatches(profile, result, CATALOGUE as EnrichedCourseRecord[]);

  const reach   = matches.filter(m => !m.excluded && m.tier_fit === 'Reach');
  const target  = matches.filter(m => !m.excluded && m.tier_fit === 'Target');
  const safety  = matches.filter(m => !m.excluded && m.tier_fit === 'Safety');

  const printRow = (m: (typeof matches)[0]) =>
    console.log(`    ${pad(m.university, 35)} ${pad(m.course.slice(0, 30), 30)} ${m.chance_percent}%`);

  console.log('\n  Programme matches:');

  if (reach.length > 0) {
    console.log('  🔺 Reach');
    reach.slice(0, 3).forEach(printRow);
  }
  if (target.length > 0) {
    console.log('  🎯 Target');
    target.slice(0, 3).forEach(printRow);
  }
  if (safety.length > 0) {
    console.log('  🛡  Safety');
    safety.slice(0, 3).forEach(printRow);
  }
  if (reach.length + target.length + safety.length === 0) {
    console.log('  (no matches in current catalogue for this cluster)');
  }
}

// ── Runner ────────────────────────────────────────────────────────────────────

export function runBatch(
  batch: Array<{ label: string; profile: StudentProfilePayload }>,
  title = 'Scoring Batch Run'
) {
  console.log(`\n${'▓'.repeat(80)}`);
  console.log(`  ASCENDA SCORING VALIDATOR — ${title}`);
  console.log(`  Weights: commitment max=${ACTIVITIES_WEIGHTS.commitment['exceptional']}  cap=${ACTIVITIES_WEIGHTS.max_total}`);
  console.log(`${'▓'.repeat(80)}`);

  const summary: Array<{ label: string; band: string; score: number; actBoost: number }> = [];

  batch.forEach(({ label, profile }) => {
    printHeader(label);
    const result = printBreakdown(profile);
    printMatches(profile, result);
    summary.push({
      label,
      band: result.student_band,
      score: result.total_score,
      actBoost: result.breakdown.activities.total,
    });
  });

  // Summary table
  console.log(`\n\n${'─'.repeat(80)}`);
  console.log('  SUMMARY TABLE');
  console.log(`${'─'.repeat(80)}`);
  console.log(`  ${'Profile'.padEnd(45)} ${'Band'.padEnd(14)} ${'Score'.padEnd(7)} ${'Activity+'.padEnd(9)}`);
  console.log(`  ${'─'.repeat(45)} ${'─'.repeat(14)} ${'─'.repeat(7)} ${'─'.repeat(9)}`);
  summary.forEach(({ label, band, score, actBoost }) => {
    const e = BAND_EMOJI[band] ?? '?';
    console.log(`  ${pad(label, 45)} ${e} ${pad(band, 12)} ${String(score).padEnd(7)} +${actBoost}`);
  });
  console.log('');
}

// ── Direct execution ──────────────────────────────────────────────────────────

if (require.main === module) {
  runBatch(PHASE1_PROFILES, 'Phase 1 — 4 Synthetic Profiles');
}
