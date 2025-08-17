import { TreeArgs } from "@/api/types";
import { supabase } from "@/lib/supabase";

/**
 * Fetches a single tree by its ID
 *
 * @param treeId - The unique identifier of the tree
 * @returns Promise that resolves to the tree data or null if not found
 * @throws {Error} When the database query fails
 */
export async function fetchTreeById(data: TreeArgs) {
  const { treeId } = data;

  const { data: tree, error } = await supabase
    .from("trees")
    .select("*")
    .eq("id", treeId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows returned
    throw error;
  }

  return tree;
}
