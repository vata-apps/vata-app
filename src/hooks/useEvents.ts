import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { EventManager } from '$managers/EventManager';
import type { EventsPageFilters } from '$db-tree/events';
import type { EventCategory } from '$types/database';

/** How many events `useEventsPage` fetches per page. */
export const EVENTS_PAGE_SIZE = 50;

export interface EventsPageQuery {
  filters: EventsPageFilters;
}

/**
 * The Events list's data source: a `LIMIT`/`OFFSET`-paginated, SQL-filtered
 * query (see issue #266). Always chronological — see `getEventsPage`'s doc
 * comment for why the paginated list has no interactive column sort.
 */
export function useEventsPage(query: EventsPageQuery) {
  return useInfiniteQuery({
    queryKey: queryKeys.eventsPage(query),
    queryFn: ({ pageParam }) =>
      EventManager.getPage({ ...query, limit: EVENTS_PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length * EVENTS_PAGE_SIZE : undefined,
  });
}

/** The Events list's Type and Place filter options — values present in the tree only. */
export function useEventFilterOptions() {
  return useQuery({
    queryKey: queryKeys.eventFilterOptions,
    queryFn: () => EventManager.getFilterOptions(),
  });
}

/** All event types, optionally filtered by category (e.g. `'individual'`). */
export function useEventTypes(category?: EventCategory, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.eventTypes(category),
    queryFn: () => EventManager.getEventTypes(category),
    enabled: options?.enabled ?? true,
  });
}
