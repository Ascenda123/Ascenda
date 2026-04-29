import type { Suggestion } from '@/components/university-search/IntelligentSearchBar';

const RESULTS_PATH = '/university-search/results';
const SEARCH_PATH = '/university-search/search';
const FILTER_KEY = 'filters';

export type FilterGroupKey = 'country' | 'subject' | 'fitFocus' | 'lifestyle';

export interface FilterChip {
  group: FilterGroupKey;
  value: string;
}

const VALID_GROUPS: FilterGroupKey[] = ['country', 'subject', 'fitFocus', 'lifestyle'];
const TOKEN_SEP = '|';
const PAIR_SEP = ':';

/** "country:USA" → { group: 'country', value: 'USA' }. Returns null on bad input. */
const parseToken = (token: string): FilterChip | null => {
  const idx = token.indexOf(PAIR_SEP);
  if (idx < 0) return null;
  const group = token.slice(0, idx) as FilterGroupKey;
  const value = token.slice(idx + 1).trim();
  if (!VALID_GROUPS.includes(group) || !value) return null;
  return { group, value };
};

/** Build a URL-safe `group:value` token. */
export const buildFilterToken = (chip: FilterChip): string =>
  `${chip.group}${PAIR_SEP}${chip.value}`;

/**
 * Serialise selected filter chips into the URL.
 * `q` is kept clean (free text only) — chip names no longer pollute it.
 */
export const buildSearchResultsUrl = (query?: string, chips?: Iterable<FilterChip>) => {
  const params = new URLSearchParams();
  const trimmed = query?.trim();
  if (trimmed) params.set('q', trimmed);

  const chipArray = chips ? Array.from(chips) : [];
  if (chipArray.length) {
    params.set(FILTER_KEY, chipArray.map(buildFilterToken).join(TOKEN_SEP));
  }

  const suffix = params.toString();
  return suffix ? `${RESULTS_PATH}?${suffix}` : RESULTS_PATH;
};

/** Build a URL back to /search with filters and query restored. */
export const buildSearchHubUrl = (query?: string, chips?: Iterable<FilterChip>) => {
  const params = new URLSearchParams();
  const trimmed = query?.trim();
  if (trimmed) params.set('q', trimmed);

  const chipArray = chips ? Array.from(chips) : [];
  if (chipArray.length) {
    params.set(FILTER_KEY, chipArray.map(buildFilterToken).join(TOKEN_SEP));
  }

  const suffix = params.toString();
  return suffix ? `${SEARCH_PATH}?${suffix}` : SEARCH_PATH;
};

/** Read structured filter chips from URL params. */
export const readFiltersFromParams = (
  reader: Pick<URLSearchParams, 'get'> | null | undefined
): FilterChip[] => {
  if (!reader) return [];
  const raw = reader.get(FILTER_KEY);
  if (!raw) return [];
  return raw
    .split(TOKEN_SEP)
    .map((token) => token.trim())
    .filter(Boolean)
    .map(parseToken)
    .filter((chip): chip is FilterChip => chip !== null);
};

/** Group chips by their group key for downstream consumers. */
export const groupFiltersByKey = (chips: FilterChip[]): Record<FilterGroupKey, string[]> => {
  const map: Record<FilterGroupKey, string[]> = {
    country: [],
    subject: [],
    fitFocus: [],
    lifestyle: []
  };
  chips.forEach((chip) => {
    map[chip.group].push(chip.value);
  });
  return map;
};

export const buildSuggestionResultsUrl = (item: Suggestion) => {
  const params = new URLSearchParams();
  if (item.type === 'program') {
    params.set('programId', item.id);
    if (item.name?.trim()) params.set('q', item.name.trim());
  } else {
    params.set('universityId', item.id);
    if (item.name?.trim()) params.set('q', item.name.trim());
  }
  return `${RESULTS_PATH}?${params.toString()}`;
};
