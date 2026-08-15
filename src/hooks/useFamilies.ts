import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { FamilyManager } from '$managers/FamilyManager';
import type { FamiliesPageFilters, FamiliesSortColumn } from '$db-tree/families';

/** How many families `useFamiliesPage` fetches per page. */
export const FAMILIES_PAGE_SIZE = 50;

export interface FamiliesPageQuery {
  filters: FamiliesPageFilters;
  sortColumn: FamiliesSortColumn;
  sortDirection: 'asc' | 'desc';
}

/**
 * The Families list's data source: a `LIMIT`/`OFFSET`-paginated, SQL-filtered
 * and SQL-sorted query (see issue #266). Mirrors `useIndividualsPage`.
 */
export function useFamiliesPage(query: FamiliesPageQuery) {
  return useInfiniteQuery({
    queryKey: queryKeys.familiesPage(query),
    queryFn: ({ pageParam }) =>
      FamilyManager.getPage({ ...query, limit: FAMILIES_PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length * FAMILIES_PAGE_SIZE : undefined,
  });
}

export function useFamily(id: string) {
  return useQuery({
    queryKey: queryKeys.family(id),
    queryFn: () => FamilyManager.getById(id),
  });
}

/** The family in which the individual is a child (father/mother), if any. */
export function useParentFamily(individualId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.parentFamily(individualId),
    queryFn: () => FamilyManager.getParentFamily(individualId),
    enabled: options?.enabled ?? true,
  });
}

/** Every family in which the individual is a spouse (husband or wife). */
export function useSpouseFamilies(individualId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.spouseFamilies(individualId),
    queryFn: () => FamilyManager.getSpouseFamiliesWithMembers(individualId),
    enabled: options?.enabled ?? true,
  });
}
