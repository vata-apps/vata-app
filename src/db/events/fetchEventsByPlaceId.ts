import { formatGedcomId } from "@/api/utils/formatGedcomId";
import { supabase } from "@/lib/supabase";

interface Params {
  placeId: string;
}

/**
 * Fetches all events for a specific place
 *
 * @param placeId - The unique identifier of the place
 * @returns Promise that resolves to an array of all events for the place
 * @throws {Error} When the database query fails
 */
export async function fetchEventsByPlaceId(params: Params) {
  const { placeId } = params;

  const { data: events, error } = await supabase
    .from("events")
    .select("id, date, description, gedcom_id, place_id, type_id")
    .eq("place_id", placeId);

  if (error) throw error;

  return events.map((event) => ({
    id: event.id,
    date: event.date,
    description: event.description,
    gedcomId: formatGedcomId({ id: event.gedcom_id, module: "events" }),
    placeId: event.place_id,
    typeId: event.type_id,
  }));
}
