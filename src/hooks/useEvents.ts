import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { EventManager } from '$managers/EventManager';
import type { EventCategory } from '$types/database';

export function useEvents() {
  return useQuery({
    queryKey: queryKeys.events,
    queryFn: () => EventManager.getAll(),
  });
}

/** All event types, optionally filtered by category (e.g. `'individual'`). */
export function useEventTypes(category?: EventCategory, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.eventTypes,
    queryFn: () => EventManager.getEventTypes(category),
    enabled: options?.enabled ?? true,
  });
}
