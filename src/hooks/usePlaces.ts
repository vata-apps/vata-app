import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { PlaceManager } from '$managers/PlaceManager';

export function usePlaces() {
  return useQuery({
    queryKey: queryKeys.places,
    queryFn: () => PlaceManager.getAll(),
  });
}
