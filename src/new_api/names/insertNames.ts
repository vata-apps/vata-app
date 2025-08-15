import { Database, TablesInsert } from "@/database.types";
import { supabase } from "@/lib/supabase";
import { IndividualArgs } from "../../api/types";

interface InsertNames extends IndividualArgs {
  names: {
    firstName?: string;
    lastName?: string;
    surname?: string;
    type: Database["public"]["Enums"]["name_type"];
  }[];
}

/**
 * Inserts multiple names for an individual into the database
 *
 * @param individualId - The unique identifier of the individual
 * @param names - Array of name objects to insert, each containing optional firstName, lastName, surname and type fields
 * @param treeId - The unique identifier of the family tree
 * @returns Promise that resolves to an array of the inserted name IDs
 * @throws {Error} When the database insertion fails
 */
export async function insertNames(data: InsertNames) {
  const { individualId, names, treeId } = data;

  const insert = names.map((name, index) => ({
    individual_id: individualId,
    is_primary: index === 0,
    tree_id: treeId,
    ...name,
  })) satisfies TablesInsert<"names">[];

  const { data: newNames, error } = await supabase
    .from("names")
    .insert(insert)
    .select("id");

  if (error) throw error;

  return newNames.map(({ id }) => id);
}
