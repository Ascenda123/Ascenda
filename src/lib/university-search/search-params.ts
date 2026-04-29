import type { Suggestion } from '@/components/university-search/IntelligentSearchBar';

const RESULTS_PATH = '/university-search/results';
const SEARCH_PATH = '/university-search/search';
const FILTER_KEY = 'filters';

const buildCombinedQuery = (query?: string, filters?: Iterable<string>) => {
  const raw = [query?.trim(), ...(filters ? Array.from(filters) : [])]
    .filter(Boolean)
    .join(' ')
    .trim();
  return raw;
};

/**
 * Serialise selected filter chips into the URL alongside the search query.
 * Filters are kept on a separate key so they can be round-tripped between
 * /search and /results without being lost in free-text concatenation.
 */
export const buildSearchResultsUrl = (query?: string, filters?: Iterable<string>) => {
  const params = new URLSearchParams();
  const filterArray = filters ? Array.from(filters).filter(Boolean) : [];
  const combined = buildCombinedQuery(query, filterArray);
  if (combined) {
    params.set('q', combined);
  }
  if (filterArray.length) {
    params.set(FILTER_KEY, filterArray.join('|'));
  }
  const suffix = params.toString();
  return suffix ? `${RESULTS_PATH}?${suffix}` : RESULTS_PATH;
};

/** Build a URL back to /search with filters and query restored. */
export const buildSearchHubUrl = (query?: string, filters?: Iterable<string>) => {
  const params = new URLSearchParams();
  const filterArray = filters ? Array.from(filters).filter(Boolean) : [];
  if (query?.trim()) params.set('q', query.trim());
  if (filterArray.length) params.set(FILTER_KEY, filterArray.join('|'));
  const suffix = params.toString();
  return suffix ? `${SEARCH_PATH}?${suffix}` : SEARCH_PATH;
};

/** Read filter chips from a URLSearchParams-like reader. */
export const readFiltersFromParams = (
  reader: Pick<URLSearchParams, 'get'> | null | undefined
): string[] => {
  if (!reader) return [];
  const raw = reader.get(FILTER_KEY);
  if (!raw) return [];
  return raw.split('|').map((value) => value.trim()).filter(Boolean);
};

export const buildSuggestionResultsUrl = (item: Suggestion) => {
  const params = new URLSearchParams();
  if (item.type === 'program') {
    params.set('programId', item.id);
    const fallbackQuery = buildCombinedQuery(item.name, item.university ? [item.university] : []);
    if (fallbackQuery) {
      params.set('q', fallbackQuery);
    }
  } else {
    params.set('universityId', item.id);
    const fallbackQuery = item.name?.trim();
    if (fallbackQuery) {
      params.set('q', fallbackQuery);
    }
  }
  return `${RESULTS_PATH}?${params.toString()}`;
};
