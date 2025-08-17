import { TreeArgs } from "@/api/types";
import { TablesUpdate } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params extends TreeArgs {
  name?: string;
  description?: string | null;
  isDefault?: boolean;
}

/**
 * Updates an existing tree in the database
 *
 * @param treeId - The unique identifier of the tree to update
 * @param name - The new name of the tree
 * @param description - The new description of the tree
 * @param isDefault - Whether this tree should be the default tree
 * @returns Promise that resolves to the updated tree data
 * @throws {Error} When the database update fails
 */
export async function updateTree(params: Params) {
  const { treeId, name, description, isDefault } = params;

  const update: TablesUpdate<"trees"> = {};
  if (name !== undefined) update.name = name;
  if (description !== undefined) update.description = description;
  if (isDefault !== undefined) update.is_default = isDefault;

  const { error } = await supabase
    .from("trees")
    .update(update)
    .eq("id", treeId);

  if (error) throw error;
}
