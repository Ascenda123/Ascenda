type ProgramLike = {
  id: string;
  metadata?: Record<string, unknown> | null;
};

const parseIdList = (value?: string | null) =>
  new Set(
    (value ?? '')
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  );

const flaggedProgramIds = parseIdList(
  process.env.NEXT_PUBLIC_FLAGGED_PROGRAM_IDS ??
  process.env.NEXT_PUBLIC_DEMO_PROGRAM_IDS ??
  process.env.DEMO_PROGRAM_IDS
);

const isDemoMetadata = (metadata: unknown) => {
  if (!metadata || typeof metadata !== 'object') return false;
  const meta = metadata as Record<string, unknown>;
  const flags = meta.flags;
  const visibility = meta.visibility ?? meta.status;
  const booleanDemo = meta.is_demo === true;
  const flaggedArray =
    Array.isArray(flags) && flags.some((flag) => typeof flag === 'string' && flag.toLowerCase() === 'demo');
  const visibilityDemo = typeof visibility === 'string' && visibility.toLowerCase() === 'demo';
  const hidden = typeof visibility === 'string' && visibility.toLowerCase() === 'hidden';
  return booleanDemo || flaggedArray || visibilityDemo || hidden;
};

export const isProgramFlagged = (program: ProgramLike) => {
  if (flaggedProgramIds.has(program.id.toLowerCase())) return true;
  return isDemoMetadata(program.metadata);
};

export const filterVisiblePrograms = <T extends ProgramLike>(programs: T[]): T[] =>
  programs.filter((program) => !isProgramFlagged(program));
