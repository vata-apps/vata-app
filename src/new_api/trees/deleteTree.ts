import { TreeArgs } from "@/api/types";
import { supabase } from "@/lib/supabase";

/**
 * Deletes a tree from the database
 *
 * @param treeId - The unique identifier of the tree to delete
 * @throws {Error} When the database deletion fails
 */
export async function deleteTree(data: TreeArgs) {
  const { treeId } = data;

  const { error } = await supabase.from("trees").delete().eq("id", treeId);

  if (error) throw error;
}
