import { supabase } from "@/lib/supabase";

interface Params {
  treeId: string;
}

/**
 * Fetches all families for a specific tree
 *
 * @param treeId - The unique identifier of the family tree
 * @returns Promise that resolves to an array of all families in the tree
 * @throws {Error} When the database query fails
 */
export async function fetchFamilies(params: Params) {
  const { treeId } = params;

  const { data: families, error } = await supabase
    .from("families")
    .select("*")
    .eq("tree_id", treeId)
    .order("created_at");

  if (error) throw error;

  return families;
}
