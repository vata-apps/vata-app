import { EventSortField, SortConfig } from "@/types/sort";
import { supabase } from "../lib/supabase";
import { getPageRange } from "./getPageRange";

/**
 * Fetches a paginated list of events (both individual and family events) from the database
 * @param params.page - The page number to fetch (1-based)
 * @param params.query - Search query to filter events by description
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
}) {
  const { start, end } = getPageRange(page);

  // Fetch individual events
  const individualEventsPromise = supabase
    .from("individual_events")
    .select(
      `
      id, 
      date, 
      description,
      type_id,
      individual_event_types(name),
      individual_id,
      individuals(
        id,
        gender,
        names(first_name, last_name, is_primary)
      ),
      place_id,
      places(name)
    `,
    )
    .ilike("description", `%${query}%`)
    .order("date", {
      ascending: sort?.field === "date" ? sort.direction === "asc" : false,
      nullsFirst: false,
    });

  // Fetch family events
  const familyEventsPromise = supabase
    .from("family_events")
    .select(
      `
      id, 
      date, 
      description,
      type_id,
      family_event_types(name),
      family_id,
      families(
        id,
        husband_id,
        wife_id,
        husband:individuals!families_husband_id_fkey(
          id,
          gender,
          names(first_name, last_name, is_primary)
        ),
        wife:individuals!families_wife_id_fkey(
          id,
          gender,
          names(first_name, last_name, is_primary)
        )
      ),
      place_id,
      places(name)
    `,
    )
    .ilike("description", `%${query}%`)
    .order("date", {
      ascending: sort?.field === "date" ? sort.direction === "asc" : false,
      nullsFirst: false,
    });

  const [individualEventsResult, familyEventsResult] = await Promise.all([
    individualEventsPromise,
    familyEventsPromise,
  ]);

  if (individualEventsResult.error) throw individualEventsResult.error;
  if (familyEventsResult.error) throw familyEventsResult.error;

  // Combine and format the results
  const combinedEvents = [
    ...individualEventsResult.data.map((event) => ({
      ...event,
      eventType: "individual",
    })),
    ...familyEventsResult.data.map((event) => ({
      ...event,
      eventType: "family",
    })),
  ];

  // Sort combined events if needed
  if (sort?.field === "date") {
    combinedEvents.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return sort.direction === "asc"
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date);
    });
  }

  // Apply pagination
  const paginatedEvents = combinedEvents.slice(start, end);

  return {
    data: paginatedEvents,
    total: combinedEvents.length,
  };
}
