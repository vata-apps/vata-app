import { TablesInsert } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  familyId: string;
  individualId: string;
  treeId: string;
}

/**
 * Inserts a new family child relationship into the database
 *
 * @param familyId - The unique identifier of the family
 * @param individualId - The unique identifier of the individual (child)
 * @param treeId - The unique identifier of the family tree
 * @returns Promise that resolves to the ID of the newly created family child relationship
 * @throws {Error} When the database insertion fails
 */
export async function insertFamilyChild(params: Params) {
  const { familyId, individualId, treeId } = params;

  const insert = {
    family_id: familyId,
    individual_id: individualId,
    tree_id: treeId,
  } satisfies TablesInsert<"family_children">;

  const { data: newFamilyChild, error } = await supabase
    .from("family_children")
    .insert(insert)
    .select("id")
    .single();

  if (error) throw error;

  return newFamilyChild.id;
}
