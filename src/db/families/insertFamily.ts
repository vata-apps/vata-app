import { Database, TablesInsert } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  treeId: string;
  husbandId?: string | null;
  wifeId?: string | null;
  type?: Database["public"]["Enums"]["family_type"];
}

/**
 * Inserts a new family into the database
 *
 * @param treeId - The unique identifier of the family tree
 * @param husbandId - The unique identifier of the husband individual
 * @param wifeId - The unique identifier of the wife individual
 * @param type - The type of family relationship
 * @returns Promise that resolves to the ID of the newly created family
 * @throws {Error} When the database insertion fails
 */
export async function insertFamily(params: Params) {
  const { treeId, husbandId, wifeId, type = "unknown" } = params;

  const insert = {
    tree_id: treeId,
    husband_id: husbandId,
    wife_id: wifeId,
    type,
  } satisfies TablesInsert<"families">;

  const { data: newFamily, error } = await supabase
    .from("families")
    .insert(insert)
    .select("id")
    .single();

  if (error) throw error;

  return newFamily.id;
}
