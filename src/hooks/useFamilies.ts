import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { FamilyManager } from '$managers/FamilyManager';

export function useFamilies() {
  return useQuery({
    queryKey: queryKeys.families,
    queryFn: () => FamilyManager.getAll(),
  });
}

export function useFamily(id: string) {
  return useQuery({
    queryKey: queryKeys.family(id),
    queryFn: () => FamilyManager.getById(id),
  });
}

/** The family in which the individual is a child (father/mother), if any. */
export function useParentFamily(individualId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.parentFamily(individualId),
    queryFn: () => FamilyManager.getParentFamily(individualId),
    enabled: options?.enabled ?? true,
  });
}

/** Every family in which the individual is a spouse (husband or wife). */
export function useSpouseFamilies(individualId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.spouseFamilies(individualId),
    queryFn: () => FamilyManager.getSpouseFamiliesWithMembers(individualId),
    enabled: options?.enabled ?? true,
  });
}
