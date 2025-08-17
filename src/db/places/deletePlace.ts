import { supabase } from "@/lib/supabase";

interface Params {
  placeId: string;
}

/**
 * Deletes a place from the database
 *
 * @param placeId - The unique identifier of the place to delete
 * @throws {Error} When the database deletion fails
 */
export async function deletePlace(params: Params) {
  const { placeId } = params;

  const { error } = await supabase.from("places").delete().eq("id", placeId);

  if (error) throw error;
}
