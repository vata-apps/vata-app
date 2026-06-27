import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { getPersonStats } from '$db-tree/person-stats';

/** Load the Person Overview headline counts (events, relations, generations). */
export function usePersonStats(individualId: string) {
  return useQuery({
    queryKey: queryKeys.personStats(individualId),
    queryFn: () => getPersonStats(individualId),
  });
}
