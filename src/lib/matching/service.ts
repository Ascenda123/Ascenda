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
import { filterVisiblePrograms } from '../catalog/visibility';
import type { Database } from '../types/database';
import type { EnrichedMatch, MissingProfileSection } from './types';

type StudentAcademicsRow = Database['public']['Tables']['student_academics']['Row'];
type StudentPreferencesRow = Database['public']['Tables']['student_preferences']['Row'];
type StudentAspirationsRow = Database['public']['Tables']['student_aspirations']['Row'];
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
};

const mapProfileRows = (params: {
  academics: StudentAcademicsRow;
  preferences: StudentPreferencesRow;
  aspirations: StudentAspirationsRow;
}) => {
  const academics: StudentAcademics = mapAcademicsRow(params.academics);
  const preferences: StudentPreferences = mapPreferencesRow(params.preferences);
  const aspirations: StudentAspirations = mapAspirationsRow(params.aspirations);
  return { academics, preferences, aspirations };
};

export const loadMatchesForProfile = async (
  supabase: Client,
  profileId: string,
  options: LoadMatchesOptions = {}
): Promise<MatchComputationResult> => {
  const programLimit = options.programLimit ?? 500;

  const [
    { data: academicsData },
    { data: preferencesData },
    { data: aspirationsData }
  ] = await Promise.all([
    supabase.from('student_academics').select('*').eq('profile_id', profileId).single(),
    supabase.from('student_preferences').select('*').eq('profile_id', profileId).single(),
    supabase.from('student_aspirations').select('*').eq('profile_id', profileId).single()
  ]);

  const missingSections: MissingProfileSection[] = [];
  if (!academicsData) missingSections.push('academics');
  if (!preferencesData) missingSections.push('preferences');
  if (!aspirationsData) missingSections.push('aspirations');

  if (missingSections.length > 0) {
    return {
      matches: [],
      catalogSize: { programs: 0, universities: 0 },
      missingSections
    };
  }

  const programQuery = supabase.from('programs').select('*').limit(programLimit);
  const { data: programsData, error: programsError } = await programQuery;

  if (programsError) {
    console.error('Failed to load catalog data', { programsError });
    return {
      matches: [],
      catalogSize: { programs: 0, universities: 0 },
      missingSections
    };
  }

  const filteredPrograms = filterVisiblePrograms((programsData ?? []) as ProgramRow[]);
  const programs: Program[] = filteredPrograms.map(mapProgramRow);

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
        : Promise.resolve({ data: [] } as { data: UniversityRow[] }),
      programIds.length
        ? supabase
          .from('program_requirements')
          .select(
            'program_id,curriculum,min_gpa,min_ib_total,min_sat,min_act,required_subjects,language_tests,other_requirements'
          )
          .in('program_id', programIds)
        : Promise.resolve({ data: [] } as { data: ProgramRequirementRow[] })
    ]);

  if (universitiesError || requirementsError) {
    console.error('Failed to load catalog data', { universitiesError, requirementsError });
    return {
      matches: [],
      catalogSize: { programs: filteredPrograms.length, universities: 0 },
      missingSections
    };
  }

  const universities: University[] = (universitiesData ?? []).map((u) => mapUniversityRow(u as any));
  const requirements: ProgramRequirement[] = (requirementsData ?? []).map((r) => mapRequirementRow(r as any));

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
    academics: academicsData!,
    preferences: preferencesData!,
    aspirations: aspirationsData!
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
