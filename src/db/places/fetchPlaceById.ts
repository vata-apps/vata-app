import { formatGedcomId } from "@/api/utils/formatGedcomId";
import { supabase } from "@/lib/supabase";
import { select } from "./utils";

interface Params {
  placeId: string;
}

/**
 * Fetches a single place by its ID
 *
 * @param placeId - The unique identifier of the place
 * @returns Promise that resolves to the place data or null if not found
 * @throws {Error} When the database query fails
 */
export async function fetchPlaceById(params: Params) {
  const { placeId } = params;

  const { data: place, error } = await supabase
    .from("places")
    .select(select)
    .eq("id", placeId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows returned
    throw error;
  }

  return {
    id: place.id,
    gedcomId: formatGedcomId({ id: place.gedcom_id, module: "places" }),
    latitude: place.latitude,
    longitude: place.longitude,
    name: place.name,
    parentId: place.parent_id,
    typeId: place.type_id,
  };
}
