import { supabase } from "../lib/supabase";

/**
 * Fetches a single event by ID, checking both individual and family events
 * @param eventId - The ID of the event to fetch
 * @param eventType - The type of event (individual or family)
 * @throws When there's an error fetching data from Supabase
 */
export async function fetchEvent(
  eventId: string,
  eventType: "individual" | "family",
) {
  if (eventType === "individual") {
    const { data, error } = await supabase
      .from("individual_events")
      .select(
        `
        id, 
        date, 
        description,
        type_id,
        individual_event_types(id, name),
        individual_id,
        individuals(
          id,
          gender,
          names(first_name, last_name, is_primary)
        ),
        place_id,
        places(id, name, latitude, longitude)
      `,
      )
      .eq("id", eventId)
      .single();

    if (error) throw error;

    return { ...data, eventType: "individual" };
  } else {
    const { data, error } = await supabase
      .from("family_events")
      .select(
        `
        id, 
        date, 
        description,
        type_id,
        family_event_types(id, name),
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
        places(id, name, latitude, longitude)
      `,
      )
      .eq("id", eventId)
      .single();

    if (error) throw error;

    return { ...data, eventType: "family" };
  }
}
