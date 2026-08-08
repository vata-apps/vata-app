import { useDebouncedValue } from './useDebouncedValue';
import { useIndividualSearch, useIndividuals } from './useIndividuals';
import type { IndividualWithDetails } from '$types/database';

const SEARCH_DEBOUNCE_MS = 200;

export interface IndividualBrowseOrSearch {
  trimmedQuery: string;
  isTyping: boolean;
  /** Whether the debounced query has caught up with what's typed — guards a "no matches" flash mid-debounce. */
  debounceSettled: boolean;
  /** The full unfiltered list, fetched only while not typing. */
  browseResults: IndividualWithDetails[];
  /** Debounced name-search results, fetched only once typing starts. */
  searchResults: IndividualWithDetails[];
  isFetching: boolean;
}

/**
 * Shared data layer for "search existing or create new" person pickers
 * (`PersonPicker`, `EventParticipantPicker`): browses the full individual
 * list while the query is empty, switches to a debounced name search once
 * typing starts. Each caller still owns its own item-mapping, sorting/tab
 * logic (e.g. a Récents vs Toutes split) and create-on-the-fly handling —
 * this hook only orchestrates the two underlying queries.
 */
export function useIndividualBrowseOrSearch(
  query: string,
  options?: { enabled?: boolean }
): IndividualBrowseOrSearch {
  const enabled = options?.enabled ?? true;
  const trimmedQuery = query.trim();
  const isTyping = trimmedQuery.length > 0;
  const debouncedQuery = useDebouncedValue(trimmedQuery, SEARCH_DEBOUNCE_MS);
  const debounceSettled = debouncedQuery === trimmedQuery;

  const browseQuery = useIndividuals({ enabled: enabled && !isTyping });
  const searchQuery = useIndividualSearch(debouncedQuery, {
    enabled: enabled && debouncedQuery.length > 0,
  });

  return {
    trimmedQuery,
    isTyping,
    debounceSettled,
    browseResults: browseQuery.data ?? [],
    searchResults: searchQuery.data ?? [],
    isFetching: isTyping ? searchQuery.isFetching : browseQuery.isFetching,
  };
}
