import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { getAllPlaceTypes } from '$db-tree/places';

/** Every place type in the open tree, ordered by sort order. */
export function usePlaceTypes() {
  return useQuery({
    queryKey: queryKeys.placeTypes,
    queryFn: () => getAllPlaceTypes(),
  });
}
