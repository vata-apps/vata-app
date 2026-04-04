import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { getCitationsBySourceId } from '$db-tree/citations';

export function useCitationsBySource(sourceId: string) {
  return useQuery({
    queryKey: queryKeys.citations(sourceId),
    queryFn: () => getCitationsBySourceId(sourceId),
  });
}
