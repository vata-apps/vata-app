import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '$lib/query-keys';
import { getCitationDetailsForSource } from '$db-tree/citations-with-details';

export function useCitationsWithDetails(sourceId: string) {
  return useQuery({
    queryKey: queryKeys.citationsWithDetails(sourceId),
    queryFn: () => getCitationDetailsForSource(sourceId),
  });
}
