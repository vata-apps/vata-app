import { supabase } from "@/lib/supabase";
import { select } from "./utils";

interface Params {
  parentId: string;
}

/**
 * Fetches all places for a specific parent place
 *
 * @param parentId - The unique identifier of the parent place
 * @returns Promise that resolves to an array of all places in the tree
 * @throws {Error} When the database query fails
 */
export async function fetchPlacesByParentId(params: Params) {
  const { parentId } = params;

  const { data: places, error } = await supabase
    .from("places")
    .select(select)
    .eq("parent_id", parentId)
    .order("name");

  if (error) throw error;

  return places;
}
