import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { FamilyManager } from '$/managers/FamilyManager';

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
