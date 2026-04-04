import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { getAllRepositories, getRepositoryById } from '$db-tree/repositories';

export function useRepositories() {
  return useQuery({
    queryKey: queryKeys.repositories,
    queryFn: () => getAllRepositories(),
  });
}

export function useRepository(id: string) {
  return useQuery({
    queryKey: queryKeys.repository(id),
    queryFn: () => getRepositoryById(id),
  });
}
