import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { IndividualManager } from '$managers/IndividualManager';
import type { IndividualsPageFilters, IndividualsSortColumn } from '$db-tree/individuals';

export function useIndividuals(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.individuals,
    queryFn: () => IndividualManager.getAll(),
    enabled: options?.enabled ?? true,
  });
}

/** How many individuals `useIndividualsPage` fetches per page. */
export const INDIVIDUALS_PAGE_SIZE = 50;

export interface IndividualsPageQuery {
  filters: IndividualsPageFilters;
  sortColumn: IndividualsSortColumn;
  sortDirection: 'asc' | 'desc';
}

/**
 * The People list's data source: a `LIMIT`/`OFFSET`-paginated, SQL-filtered
 * and SQL-sorted query (see issue #266). `query` re-keys the cache on every
 * filter/sort change — TanStack Query then refetches from the first page —
 * while `fetchNextPage` walks forward within one filter/sort combination.
 */
export function useIndividualsPage(query: IndividualsPageQuery) {
  return useInfiniteQuery({
    queryKey: queryKeys.individualsPage(query),
    queryFn: ({ pageParam }) =>
      IndividualManager.getPage({ ...query, limit: INDIVIDUALS_PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length * INDIVIDUALS_PAGE_SIZE : undefined,
  });
}

export function useIndividual(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.individual(id),
    queryFn: () => IndividualManager.getById(id),
    enabled: options?.enabled ?? true,
  });
}

/**
 * Cap on `useIndividualSearch` results. Its only callers (`PersonPicker`,
 * `EventParticipantPicker`, via `useIndividualBrowseOrSearch`) display at
 * most 8 results and show a "+N more, refine your search" hint for the
 * rest — but both also filter out already-picked people (`excludeIds`)
 * *after* the search runs, and `searchIndividuals` orders by id, not
 * relevance, so a narrow query whose lowest-id matches are mostly excluded
 * needs real headroom to still surface 8 real results. 200 clears that
 * margin while staying inside `IndividualManager.getByIds`'s single
 * `IN (...)` chunk (`SQLITE_IN_CLAUSE_LIMIT`), so enrichment cost is
 * unaffected by the choice (issue #268).
 */
export const SEARCH_RESULTS_LIMIT = 200;

/** Name search for pickers (e.g. the Person editor's relation picker). Blank queries are disabled by the caller. */
export function useIndividualSearch(query: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.individualSearch(query),
    queryFn: () => IndividualManager.search(query, SEARCH_RESULTS_LIMIT),
    enabled: options?.enabled ?? true,
  });
}
