import { supabase } from "@/lib/supabase";

interface Params {
  treeId: string;
}

/**
 * Fetches all places for a specific tree
 *
 * @param treeId - The unique identifier of the family tree
 * @returns Promise that resolves to an array of all places in the tree
 * @throws {Error} When the database query fails
 */
export async function fetchPlaces(params: Params) {
  const { treeId } = params;

  const { data: places, error } = await supabase
    .from("places")
    .select("*")
    .eq("tree_id", treeId)
    .order("name");

  if (error) throw error;

  return places;
}
