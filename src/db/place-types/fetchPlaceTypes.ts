import { supabase } from "@/lib/supabase";

interface Params {
  treeId: string;
}

/**
 * Fetches all place types for a specific tree
 *
 * @param treeId - The unique identifier of the family tree
 * @returns Promise that resolves to an array of all place types in the tree
 * @throws {Error} When the database query fails
 */
export async function fetchPlaceTypes(params: Params) {
  const { treeId } = params;

  const { data: placeTypes, error } = await supabase
    .from("place_types")
    .select("*")
    .eq("tree_id", treeId)
    .order("name");

  if (error) throw error;

  return placeTypes;
}
