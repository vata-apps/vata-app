import { supabase } from "@/lib/supabase";

interface Params {
  treeId: string;
}

/**
 * Fetches all individuals for a specific tree
 *
 * @param treeId - The unique identifier of the family tree
 * @returns Promise that resolves to an array of all individuals in the tree
 * @throws {Error} When the database query fails
 */
export async function fetchIndividuals(params: Params) {
  const { treeId } = params;

  const { data: individuals, error } = await supabase
    .from("individuals")
    .select("*")
    .eq("tree_id", treeId)
    .order("created_at");

  if (error) throw error;

  return individuals;
}
