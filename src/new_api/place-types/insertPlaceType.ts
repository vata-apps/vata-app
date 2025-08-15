import { TablesInsert } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  treeId: string;
  name: string;
}

/**
 * Inserts a new place type into the database
 *
 * @param treeId - The unique identifier of the family tree
 * @param name - The name of the place type
 * @param key - The key identifier for the place type
 * @param isSystem - Whether this is a system-defined place type
 * @returns Promise that resolves to the ID of the newly created place type
 * @throws {Error} When the database insertion fails
 */
export async function insertPlaceType(params: Params) {
  const { treeId, name } = params;

  const insert = {
    tree_id: treeId,
    name,
  } satisfies TablesInsert<"place_types">;

  const { data: newPlaceType, error } = await supabase
    .from("place_types")
    .insert(insert)
    .select("id")
    .single();

  if (error) throw error;

  return newPlaceType.id;
}
