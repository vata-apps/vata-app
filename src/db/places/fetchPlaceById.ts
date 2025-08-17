import { supabase } from "@/lib/supabase";

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
    .select("*")
    .eq("id", placeId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows returned
    throw error;
  }

  return place;
}
