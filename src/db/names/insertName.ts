import { Database, TablesInsert } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  individualId: string;
  treeId: string;
  firstName?: string | null;
  lastName?: string | null;
  surname?: string | null;
  type: Database["public"]["Enums"]["name_type"];
  isPrimary?: boolean;
}

/**
 * Inserts a single name for an individual into the database
 *
 * @param individualId - The unique identifier of the individual
 * @param treeId - The unique identifier of the family tree
 * @param firstName - The first name
 * @param lastName - The last name
 * @param surname - The surname
 * @param type - The type of name (birth, marriage, nickname, unknown)
 * @param isPrimary - Whether this is the primary name for the individual
 * @returns Promise that resolves to the ID of the inserted name
 * @throws {Error} When the database insertion fails
 */
export async function insertName(params: Params) {
  const {
    individualId,
    treeId,
    firstName,
    lastName,
    surname,
    type,
    isPrimary = false,
  } = params;

  const insert = {
    individual_id: individualId,
    tree_id: treeId,
    first_name: firstName,
    last_name: lastName,
    surname,
    type,
    is_primary: isPrimary,
  } satisfies TablesInsert<"names">;

  const { data: newName, error } = await supabase
    .from("names")
    .insert(insert)
    .select("id")
    .single();

  if (error) throw error;

  return newName.id;
}
