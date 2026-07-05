import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { getAncestors } from '$db-tree/ancestors';
import { buildAncestorsChart } from '$components/person-ancestors/build-ancestors';

/** Load and lay out one individual's fixed-depth ancestor tree for their Pedigree tab. */
export function useAncestors(individualId: string) {
  return useQuery({
    queryKey: queryKeys.ancestors(individualId),
    queryFn: async () => buildAncestorsChart(await getAncestors(individualId)),
  });
}
