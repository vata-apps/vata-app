import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { getPersonEvents } from '$db-tree/person-events';

/**
 * Load every event connected to one individual for their Events tab, tagged by
 * scope (principal / union / secondary) so the view can filter by scope level.
 */
export function usePersonEvents(individualId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.personEvents(individualId),
    queryFn: () => getPersonEvents(individualId),
    enabled: options?.enabled ?? true,
  });
}
