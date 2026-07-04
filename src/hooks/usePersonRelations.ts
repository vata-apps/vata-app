import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { getPersonRelations } from '$db-tree/person-relations';
import { buildPersonRelations } from '$components/person-relations/build-relations';

/** Load and shape one individual's direct relations for their Relations tab. */
export function usePersonRelations(individualId: string) {
  return useQuery({
    queryKey: queryKeys.personRelations(individualId),
    queryFn: async () => buildPersonRelations(await getPersonRelations(individualId)),
  });
}
