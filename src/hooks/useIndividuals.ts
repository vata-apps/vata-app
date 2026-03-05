import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { IndividualManager } from '$/managers/IndividualManager';

export function useIndividuals() {
  return useQuery({
    queryKey: queryKeys.individuals,
    queryFn: () => IndividualManager.getAll(),
  });
}

export function useIndividual(id: string) {
  return useQuery({
    queryKey: queryKeys.individual(id),
    queryFn: () => IndividualManager.getById(id),
  });
}
