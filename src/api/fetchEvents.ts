import { Tables } from "@/database.types";
import { EventSortField, SortConfig } from "@/types/sort";
import { supabase } from "../lib/supabase";
import { getPageRange } from "./getPageRange";

// Define types for the processed events we export
type NameRow = Pick<Tables<"names">, "first_name" | "last_name" | "is_primary">;

type IndividualWithNames = {
  id: string;
  gender: Tables<"individuals">["gender"];
  names: NameRow[];
};

type FamilyWithSpouses = {
  id: string;
  husband_id: string | null;
  wife_id: string | null;
  husband?: IndividualWithNames | null;
  wife?: IndividualWithNames | null;
};

// Event base properties
type EventBase = {
  id: string;
  date: string | null;
  description: string | null;
  place_id: string | null;
  places?: { name: string } | null;
};

// Processed event types for export
export type IndividualEventWithRelations = EventBase & {
  type_id: string;
  individual_id: string;
  individual_event_types: { name: string };
  individuals: IndividualWithNames;
  eventType: "individual";
};

export type FamilyEventWithRelations = EventBase & {
  type_id: string;
  family_id: string;
  family_event_types: { name: string };
  families: FamilyWithSpouses;
  eventType: "family";
};

export type EventWithRelations =
  | IndividualEventWithRelations
  | FamilyEventWithRelations;

/**
 * Helper function to safely extract first element from array or return the value
 */
function getFirstOrValue<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value;
}

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

  // Transform and combine the results - handle the fact that Supabase returns arrays for joined data
  const individualEvents: IndividualEventWithRelations[] =
    individualEventsResult.data.map((event: unknown) => {
      const e = event as Record<string, unknown>;
      return {
        id: e.id as string,
        date: e.date as string | null,
        description: e.description as string | null,
        place_id: e.place_id as string | null,
        type_id: e.type_id as string,
        individual_id: e.individual_id as string,
        individual_event_types: getFirstOrValue(
          e.individual_event_types as { name: string } | { name: string }[],
        ),
        individuals: getFirstOrValue(
          e.individuals as IndividualWithNames | IndividualWithNames[],
        ),
        places: getFirstOrValue(
          e.places as { name: string } | { name: string }[] | null,
        ),
        eventType: "individual" as const,
      };
    });

  const familyEvents: FamilyEventWithRelations[] = familyEventsResult.data.map(
    (event: unknown) => {
      const e = event as Record<string, unknown>;
      return {
        id: e.id as string,
        date: e.date as string | null,
        description: e.description as string | null,
        place_id: e.place_id as string | null,
        type_id: e.type_id as string,
        family_id: e.family_id as string,
        family_event_types: getFirstOrValue(
          e.family_event_types as { name: string } | { name: string }[],
        ),
        families: getFirstOrValue(
          e.families as FamilyWithSpouses | FamilyWithSpouses[],
        ),
        places: getFirstOrValue(
          e.places as { name: string } | { name: string }[] | null,
        ),
        eventType: "family" as const,
      };
    },
  );

  const combinedEvents: EventWithRelations[] = [
    ...individualEvents,
    ...familyEvents,
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
