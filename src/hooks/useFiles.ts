import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { getFilesBySourceId } from '$db-tree/files';

export function useFilesBySource(sourceId: string) {
  return useQuery({
    queryKey: queryKeys.files(sourceId),
    queryFn: () => getFilesBySourceId(sourceId),
  });
}
