import type { Suggestion } from '@/components/university-search/IntelligentSearchBar';

const RESULTS_PATH = '/university-search/results';

const buildCombinedQuery = (query?: string, filters?: Iterable<string>) => {
  const raw = [query?.trim(), ...(filters ? Array.from(filters) : [])]
    .filter(Boolean)
    .join(' ')
    .trim();
  return raw;
};

export const buildSearchResultsUrl = (query?: string, filters?: Iterable<string>) => {
  const params = new URLSearchParams();
  const combined = buildCombinedQuery(query, filters);
  if (combined) {
    params.set('q', combined);
  }
  const suffix = params.toString();
  return suffix ? `${RESULTS_PATH}?${suffix}` : RESULTS_PATH;
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
