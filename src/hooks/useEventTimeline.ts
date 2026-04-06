import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '$/lib/query-keys';
import { getEventTimelineForIndividual } from '$db-tree/event-timeline';

export function useEventTimeline(individualId: string) {
  return useQuery({
    queryKey: queryKeys.eventTimeline(individualId),
    queryFn: () => getEventTimelineForIndividual(individualId),
  });
}
