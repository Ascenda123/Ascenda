// Translates the raw eligibility_flags / readiness_flags strings produced by
// student_scoring into a single high-level "pathway openness" status pill on
// the profile page. Anchors the Beat 2 talking point — "one in five students
// unintentionally close doors through subject choices."

export type PathwayStatus = 'open' | 'limited' | 'closed';

export interface PathwayInsight {
  status: PathwayStatus;
  label: string;
  message: string;
  count: number;
  examples: string[];
}

const CLUSTER_LABEL: Record<string, string> = {
  engineering: 'Engineering',
  medicine: 'Medicine',
  business_economics: 'Business & Economics',
  computer_science: 'Computer Science',
  natural_sciences: 'Natural Sciences',
  social_sciences: 'Social Sciences',
  humanities: 'Humanities',
  arts: 'Arts',
  law: 'Law',
  architecture: 'Architecture'
};

const formatCluster = (raw: string): string => {
  const cleaned = raw.trim();
  if (CLUSTER_LABEL[cleaned]) return CLUSTER_LABEL[cleaned];
  return cleaned
    .split('_')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
};

export const summarisePathwayStatus = (
  eligibilityFlags: string[] | null | undefined,
  readinessFlags: string[] | null | undefined
): PathwayInsight => {
  const eligibility = eligibilityFlags ?? [];
  const readiness = readinessFlags ?? [];

  const subjectGaps = eligibility
    .filter((flag) => flag.startsWith('required_subjects_missing:'))
    .map((flag) => formatCluster(flag.split(':', 2)[1] ?? ''));

  const testGaps = eligibility
    .filter((flag) => flag.startsWith('admissions_test_missing:'))
    .map((flag) => (flag.split(':', 2)[1] ?? '').toUpperCase());

  const englishGap = readiness.includes('english_test_missing');

  // Subject lock-outs are the loudest signal — they map directly to closed
  // pathways and are non-reversible once exam choices are locked in.
  if (subjectGaps.length > 0) {
    const examples = subjectGaps.slice(0, 2);
    return {
      status: 'closed',
      label: 'Subject choices recommended',
      message:
        examples.length === 1
          ? `Current subjects keep most pathways open, but ${examples[0]} requires a different combination.`
          : `Current subjects close pathways into ${examples.join(' and ')}. Worth reviewing before the next exam window.`,
      count: subjectGaps.length,
      examples
    };
  }

  // Mid-tier signal — pathways are open but a test or English requirement
  // could still narrow the field.
  if (testGaps.length > 0 || englishGap) {
    const items = [
      testGaps.length ? `${testGaps.slice(0, 2).join(', ')} test${testGaps.length === 1 ? '' : 's'} pending` : null,
      englishGap ? 'English evidence pending' : null
    ].filter(Boolean) as string[];
    return {
      status: 'limited',
      label: 'A couple of items pending',
      message: `Pathways are open. ${items.join(' · ')} — handle these to unlock the full match list.`,
      count: testGaps.length + (englishGap ? 1 : 0),
      examples: items
    };
  }

  return {
    status: 'open',
    label: 'Pathways open',
    message:
      'Subjects, tests, and English requirements all check out. The full match list is available to you.',
    count: 0,
    examples: []
  };
};
