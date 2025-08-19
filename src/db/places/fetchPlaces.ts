import { supabase } from "@/lib/supabase";

interface Params {
  filters?: {
    parentId?: string;
    placeIds?: string[];
  };
  treeId: string;
}

/**
 * Fetches all places for a specific tree
 *
 * @param treeId - The unique identifier of the family tree
 * @param filters - The filters to apply to the query
 * @param filters.parentId - The ID of the parent place
 * @param filters.placeIds - The IDs of the places to fetch
 * @returns Promise that resolves to an array of all places in the tree
 * @throws {Error} When the database query fails
 */
export async function fetchPlaces(params: Params) {
  const { treeId, filters } = params;

  let query = supabase
    .from("places")
    .select("id, gedcom_id, latitude, longitude, name, parent_id, type_id")
    .eq("tree_id", treeId)
    .order("name");

  if (filters?.parentId) {
    query = query.eq("parent_id", filters.parentId);
  }

  if (filters?.placeIds) {
    query = query.in("id", filters.placeIds);
  }

  const { data: places, error } = await query;

  if (error) throw error;

  return places;
}
