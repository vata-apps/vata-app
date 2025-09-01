import { supabase } from "@/lib/supabase";
import { select } from "./utils";

interface Params {
  placeTypeId: string;
}

/**
 * Fetches a single place type by its ID
 *
 * @param placeTypeId - The unique identifier of the place type
 * @returns Promise that resolves to the place type data or null if not found
 * @throws {Error} When the database query fails
 */
export async function fetchPlaceTypeById(params: Params) {
  const { placeTypeId } = params;

  const { data: placeType, error } = await supabase
    .from("place_types")
    .select(select)
    .eq("id", placeTypeId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows returned
    throw error;
  }

  return placeType;
}
