import type { EventListItem } from "@/types/event";
import type { EventSortField, SortConfig } from "@/types/sort";
import { supabase } from "../lib/supabase";

/**
 * Fetches a paginated list of events with optional filtering
 * @param params.page - The page number to fetch (1-based)
 * @param params.query - Search query to filter events by description or subject names
 * @param params.sort - Optional sorting configuration
 * @param params.placeId - Optional place ID to filter events by location
 * @throws When there's an error fetching data from Supabase
 */
export async function fetchEventsFiltered({
  page,
  query,
  sort,
  placeId,
}: {
  page: number;
  query: string;
  sort?: SortConfig<EventSortField>;
  placeId?: string;
}): Promise<{
  data: EventListItem[];
  total: number;
}> {
  // Use the new unified RPC function that supports place filtering
  const { data, error } = await supabase.rpc(
    "get_events_with_subjects_filtered",
    {
      search_text: query || null,
      page_number: page,
      sort_field: sort?.field || "date",
      sort_direction: sort?.direction || "desc",
      place_filter_id: placeId || null,
    },
  );

  if (error) throw error;

  // Transform the data to match our EventListItem type
  const events: EventListItem[] = (data || []).map(
    (event: {
      id: string;
      date: string;
      description: string;
      event_type_name: string;
      place_name: string;
      subjects: string;
    }) => ({
      id: event.id,
      date: event.date,
      description: event.description,
      event_type_name: event.event_type_name,
      place_name: event.place_name,
      subjects: event.subjects,
    }),
  );

  // Apply pagination to the results
  const pageSize = 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedEvents = events.slice(startIndex, endIndex);

  return {
    data: paginatedEvents,
    total: events.length,
  };
}
