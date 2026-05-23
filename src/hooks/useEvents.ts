import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { EventManager } from '$managers/EventManager';

export function useEvents() {
  return useQuery({
    queryKey: queryKeys.events,
    queryFn: () => EventManager.getAll(),
  });
}
