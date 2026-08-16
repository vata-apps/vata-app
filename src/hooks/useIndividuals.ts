import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { IndividualManager } from '$managers/IndividualManager';
import { formatNameSimple } from '$db-tree/names';
import { sortByKey } from '$lib/sortByKey';
import type { IndividualsPageFilters, IndividualsSortColumn } from '$db-tree/individuals';
import type { IndividualWithDetails } from '$types/database';

export function useIndividuals(options?: {
  enabled?: boolean;
  /** Derives the query's exposed `data` — see {@link sortIndividualsByName} for why a stable reference matters. */
  select?: (individuals: IndividualWithDetails[]) => IndividualWithDetails[];
}) {
  return useQuery({
    queryKey: queryKeys.individuals,
    queryFn: () => IndividualManager.getAll(),
    enabled: options?.enabled ?? true,
    select: options?.select,
  });
}

/**
 * Sorts by primary name. Exported as a stable top-level reference (rather
 * than an inline arrow at each call site) so TanStack Query's `select`
 * memoizes the sorted array per observer and only recomputes it when the
 * underlying `['individuals']` fetch actually changes — not on every render,
 * which is what let the relation/participant pickers each re-sort the full
 * tree per keystroke before issue #269.
 */
export function sortIndividualsByName(
  individuals: IndividualWithDetails[]
): IndividualWithDetails[] {
  return sortByKey(individuals, (individual) => formatNameSimple(individual.primaryName));
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

/** Name search for pickers (e.g. the Person editor's relation picker). Blank queries are disabled by the caller. */
export function useIndividualSearch(query: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.individualSearch(query),
    queryFn: () => IndividualManager.search(query),
    enabled: options?.enabled ?? true,
  });
}
