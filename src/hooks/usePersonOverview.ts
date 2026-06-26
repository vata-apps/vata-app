import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { buildPersonOverview } from '$components/person-overview-radix/build-overview';
import { getPersonOverview } from '$db-tree/person-overview';

/**
 * Load and shape the Person Overview for one individual. Fetches the pre-joined
 * tree data and maps it to the Radix view-model in `select`, so the mapping
 * re-runs without refetching. Resolves to `null` when the individual is absent.
 */
export function usePersonOverview(individualId: string) {
  return useQuery({
    queryKey: queryKeys.personOverview(individualId),
    queryFn: () => getPersonOverview(individualId),
    select: (data) => (data ? buildPersonOverview(data) : null),
  });
}
