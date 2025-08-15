import { TablesInsert } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  name: string;
  description?: string | null;
  isDefault?: boolean;
}

/**
 * Inserts a new tree into the database
 *
 * @param name - The name of the tree
 * @param description - Optional description of the tree
 * @param isDefault - Whether this tree should be the default tree
 * @returns Promise that resolves to the ID of the newly created tree
 * @throws {Error} When the database insertion fails
 */
export async function insertTree(params: Params) {
  const { name, description, isDefault = false } = params;

  const insert = {
    name,
    description,
    is_default: isDefault,
  } satisfies TablesInsert<"trees">;

  const { data: newTree, error } = await supabase
    .from("trees")
    .insert(insert)
    .select("id")
    .single();

  if (error) throw error;

  return newTree.id;
}
