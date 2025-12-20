import type { SupabaseClient } from '@supabase/supabase-js';
import { defaultWeights, type MatchingWeights } from './config';
import {
  rankMatches,
  type MatchInput,
  type Program,
  type ProgramRequirement,
  type StudentAcademics,
  type StudentAspirations,
  type StudentPreferences,
  type University
} from './engine';
import {
  buildMatchInput,
  mapAcademicsRow,
  mapAspirationsRow,
  mapPreferencesRow,
  mapProgramRow,
  mapRequirementRow,
  mapUniversityRow
} from './transform';
import { filterVisiblePrograms, getFlaggedProgramIds } from '../catalog/visibility';
import type { Database } from '../types/database';
import type { EnrichedMatch, MissingProfileSection } from './types';

type StudentAcademicInputRow = Database['public']['Tables']['student_academic_input']['Row'];
type StudentLifestyleRow = Database['public']['Tables']['student_lifestyle_preference']['Row'];
type StudentSubjectRow = Database['public']['Tables']['student_subjects']['Row'];
type ProgramRow = Database['public']['Tables']['programs']['Row'];
type UniversityRow = Database['public']['Tables']['universities']['Row'];
type ProgramRequirementRow = Database['public']['Tables']['program_requirements']['Row'];

type Client = SupabaseClient<Database>;

type LoadMatchesOptions = {
  programLimit?: number;
  resultLimit?: number;
  weights?: MatchingWeights;
};

export type MatchComputationResult = {
  matches: EnrichedMatch[];
  catalogSize: { programs: number; universities: number };
  missingSections: MissingProfileSection[];
  error?: { stage: 'profile' | 'programs' | 'universities' | 'requirements'; message: string };
};

const mapProfileRows = (params: {
  academicInput: StudentAcademicInputRow;
  lifestyle: StudentLifestyleRow | null;
  subjects: StudentSubjectRow[];
}) => {
  const academics: StudentAcademics = mapAcademicsRow(params.academicInput, params.subjects);
  const preferences: StudentPreferences = mapPreferencesRow(params.lifestyle);
  const aspirations: StudentAspirations = mapAspirationsRow(params.academicInput);
  return { academics, preferences, aspirations };
};

const PROGRAM_PAGE_SIZE = 200;

const applyProgramVisibilityFilters = (query: ReturnType<Client['from']>) => {
  const flagged = getFlaggedProgramIds();
  if (!flagged.length) return query.order('id', { ascending: true });

  const formatted = flagged.map((id) => `"${id}"`).join(',');
  return query.not('id', 'in', `(${formatted})`).order('id', { ascending: true });
};

export const loadMatchesForProfile = async (
  supabase: Client,
  profileId: string,
  options: LoadMatchesOptions = {}
): Promise<MatchComputationResult> => {
  const programLimit = options.programLimit ?? 800;

  const [
    { data: academicData, error: academicError },
    { data: lifestyleData, error: lifestyleError },
    { data: subjectsData, error: subjectsError }
  ] = await Promise.all([
    supabase.from('student_academic_input').select('*').eq('profile_id', profileId).maybeSingle(),
    supabase.from('student_lifestyle_preference').select('*').eq('profile_id', profileId).maybeSingle(),
    supabase.from('student_subjects').select('*').eq('profile_id', profileId)
  ]);

  const profileErrors = [academicError, lifestyleError, subjectsError].filter((err) => err && err.code !== 'PGRST116');
  if (profileErrors.length > 0) {
    return {
      matches: [],
      catalogSize: { programs: 0, universities: 0 },
      missingSections: [],
      error: { stage: 'profile', message: 'Failed to load profile data' }
    };
  }

  const missingSections: MissingProfileSection[] = [];
  if (!academicData) missingSections.push('academic_input');
  if (!subjectsData || subjectsData.length === 0) missingSections.push('academic_details');
  if (!lifestyleData) missingSections.push('lifestyle_preferences');

  if (missingSections.length > 0) {
    return {
      matches: [],
      catalogSize: { programs: 0, universities: 0 },
      missingSections
    };
  }

  const programsData: ProgramRow[] = [];
  let offset = 0;
  while (programsData.length < programLimit) {
    const rangeFrom = offset;
    const rangeTo = Math.min(offset + PROGRAM_PAGE_SIZE - 1, programLimit - 1);
    let programQuery = supabase.from('programs').select('*');
    programQuery = applyProgramVisibilityFilters(programQuery).range(rangeFrom, rangeTo);
    const { data, error: programsError } = await programQuery;
    if (programsError) {
      console.error('Failed to load catalog data', { programsError });
      return {
        matches: [],
        catalogSize: { programs: 0, universities: 0 },
        missingSections,
        error: { stage: 'programs', message: 'Failed to load programs' }
      };
    }
    if (!data || data.length === 0) break;
    programsData.push(...data);
    if (data.length < PROGRAM_PAGE_SIZE) break;
    offset += PROGRAM_PAGE_SIZE;
  }

  if (programsData.length === 0) {
    return {
      matches: [],
      catalogSize: { programs: 0, universities: 0 },
      missingSections
    };
  }

  const normalizeMetadata = (value: unknown): Record<string, unknown> | null => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    return null;
  };

  const visibilityCheck = (programsData ?? []).map((p) => ({
    id: p.id,
    metadata: normalizeMetadata((p as any).metadata)
  }));
  const visibleIds = new Set(filterVisiblePrograms(visibilityCheck).map((p) => p.id));
  const filteredPrograms = (programsData ?? []).filter((p) => visibleIds.has(p.id));
  const programs: Program[] = filteredPrograms.map((program) =>
    mapProgramRow({ ...program, metadata: normalizeMetadata((program as any).metadata) } as any)
  );

  if (!programs.length) {
    return {
      matches: [],
      catalogSize: { programs: filteredPrograms.length, universities: 0 },
      missingSections
    };
  }

  const programIds = programs.map((program) => program.id);
  const universityIds = programs.map((program) => program.universityId);

  const [{ data: universitiesData, error: universitiesError }, { data: requirementsData, error: requirementsError }] =
    await Promise.all([
      universityIds.length
        ? supabase
          .from('universities')
          .select('id,name,country,region,rank_overall,rank_source,acceptance_rate,requires_test,metadata')
          .in('id', universityIds)
        : Promise.resolve({ data: [] as UniversityRow[], error: null }),
      programIds.length
        ? supabase
          .from('program_requirements')
          .select(
            'program_id,curriculum,min_gpa,min_ib_total,min_sat,min_act,required_subjects,language_tests,other_requirements'
          )
          .in('program_id', programIds)
        : Promise.resolve({ data: [] as ProgramRequirementRow[], error: null })
  ]);

  if (universitiesError || requirementsError) {
    console.error('Failed to load catalog data', { universitiesError, requirementsError });
    return {
      matches: [],
      catalogSize: { programs: filteredPrograms.length, universities: 0 },
      missingSections,
      error: {
        stage: universitiesError ? 'universities' : 'requirements',
        message: universitiesError ? 'Failed to load universities' : 'Failed to load program requirements'
      }
    };
  }

  const universities: University[] = (universitiesData ?? []).map((u) => mapUniversityRow(u));
  const requirements: ProgramRequirement[] = (requirementsData ?? []).map((r) => mapRequirementRow(r));

  if (!programs.length || !universities.length) {
    return {
      matches: [],
      catalogSize: { programs: filteredPrograms.length, universities: universities.length },
      missingSections
    };
  }

  const requirementMap = new Map(requirements.map((item) => [item.programId, item]));
  const universityMap = new Map(universities.map((item) => [item.id, item]));
  const { academics, preferences, aspirations } = mapProfileRows({
    academicInput: academicData!,
    lifestyle: lifestyleData ?? null,
    subjects: (subjectsData ?? []) as StudentSubjectRow[]
  });

  const inputs: MatchInput[] = programs
    .map((program) => {
      const university = universityMap.get(program.universityId);
      if (!university) return null;
      return buildMatchInput({
        academics,
        preferences,
        aspirations,
        program,
        university,
        requirement: requirementMap.get(program.id)
      });
    })
    .filter((value): value is MatchInput => value !== null);

  const weights = options.weights ?? defaultWeights;
  const ranked = rankMatches(inputs, weights);
  const limited = options.resultLimit ? ranked.slice(0, options.resultLimit) : ranked;

  const matches: EnrichedMatch[] = limited.map((result) => {
    const program = programs.find((item) => item.id === result.programId)!;
    const university = universityMap.get(result.universityId)!;
    return {
      program,
      university: { ...university, requiresTest: university.requiresTest },
      score: result.score,
      breakdown: result.breakdown,
      blockingReasons: result.blockingReasons,
      tier: result.tier
    };
  });

  return {
    matches,
    catalogSize: { programs: filteredPrograms.length, universities: universities.length },
    missingSections
  };
};
