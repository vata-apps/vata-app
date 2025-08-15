import { supabase } from "@/lib/supabase";

interface Params {
  placeTypeId: string;
}

/**
 * Deletes a place type from the database
 *
 * @param placeTypeId - The unique identifier of the place type to delete
 * @throws {Error} When the database deletion fails
 */
export async function deletePlaceType(params: Params) {
  const { placeTypeId } = params;

  const { error } = await supabase
    .from("place_types")
    .delete()
    .eq("id", placeTypeId);

  if (error) throw error;
}
