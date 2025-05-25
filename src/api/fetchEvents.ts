import type { EventListItem } from "@/types/event";
import type { EventSortField, SortConfig } from "@/types/sort";
import { supabase } from "../lib/supabase";
import { getPageRange } from "./getPageRange";

/**
 * Fetches a paginated list of events from the unified event system
 * @param params.page - The page number to fetch (1-based)
 * @param params.query - Search query to filter events by description or subject names
 * @param params.sort - Optional sorting configuration
 * @throws When there's an error fetching data from Supabase
 */
export async function fetchEvents({
  page,
  query,
  sort,
}: {
  page: number;
  query: string;
  sort?: SortConfig<EventSortField>;
}): Promise<{
  data: EventListItem[];
  total: number;
}> {
  const { start, end } = getPageRange(page);

  // Use the RPC function to get events with subjects
  const { data, error } = await supabase.rpc("get_events_with_subjects", {
    search_text: query || null,
    page_number: page,
    sort_field: sort?.field || "date",
    sort_direction: sort?.direction || "desc",
  });

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
  const paginatedEvents = events.slice(start, end);

  return {
    data: paginatedEvents,
    total: events.length,
  };
}
