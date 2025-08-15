import { supabase } from "@/lib/supabase";

/**
 * Fetches all trees from the database
 *
 * @returns Promise that resolves to an array of all trees
 * @throws {Error} When the database query fails
 */
export async function fetchTrees() {
  const { data: trees, error } = await supabase
    .from("trees")
    .select("*")
    .order("name");

  if (error) throw error;

  return trees;
}
