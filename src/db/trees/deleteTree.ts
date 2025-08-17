import { supabase } from "@/lib/supabase";

interface Params {
  treeId: string;
}

/**
 * Deletes a tree from the database
 *
 * @param treeId - The unique identifier of the tree to delete
 * @throws {Error} When the database deletion fails
 */
export async function deleteTree(params: Params) {
  const { treeId } = params;

  const { error } = await supabase.from("trees").delete().eq("id", treeId);

  if (error) throw error;
}
