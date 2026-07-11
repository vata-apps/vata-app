import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { IndividualManager } from '$managers/IndividualManager';

export function useIndividuals(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.individuals,
    queryFn: () => IndividualManager.getAll(),
    enabled: options?.enabled ?? true,
  });
}

export function useIndividual(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.individual(id),
    queryFn: () => IndividualManager.getById(id),
    enabled: options?.enabled ?? true,
  });
}

/** Name search for pickers (e.g. the Person editor's relation picker). Blank queries are disabled by the caller. */
export function useIndividualSearch(query: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.individualSearch(query),
    queryFn: () => IndividualManager.search(query),
    enabled: options?.enabled ?? true,
  });
}
