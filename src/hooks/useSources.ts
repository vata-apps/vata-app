import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { getAllSources, getSourceById, searchSources } from '$db-tree/sources';

export function useSources() {
  return useQuery({
    queryKey: queryKeys.sources,
    queryFn: () => getAllSources(),
  });
}

export function useSource(id: string) {
  return useQuery({
    queryKey: queryKeys.source(id),
    queryFn: () => getSourceById(id),
  });
}

export function useSearchSources(query: string) {
  return useQuery({
    queryKey: [...queryKeys.sources, 'search', query],
    queryFn: () => (query.trim() ? searchSources(query) : getAllSources()),
  });
}
