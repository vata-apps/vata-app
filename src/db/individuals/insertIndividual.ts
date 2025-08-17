import { TreeArgs } from "@/api/types";
import { Database, TablesInsert } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params extends TreeArgs {
  gender: Database["public"]["Enums"]["gender"];
}

/**
 * Inserts a new individual into the database
 *
 * @param gender - The gender of the individual (from the database enum)
 * @param treeId - The unique identifier of the family tree
 * @returns Promise that resolves to the ID of the newly created individual
 * @throws {Error} When the database insertion fails
 */
export async function insertIndividual(params: Params) {
  const { gender, treeId } = params;

  const insert = {
    tree_id: treeId,
    gender,
  } satisfies TablesInsert<"individuals">;

  const { data: newIndividual, error } = await supabase
    .from("individuals")
    .insert(insert)
    .select("id")
    .single();

  if (error) throw error;

  return newIndividual.id;
}
