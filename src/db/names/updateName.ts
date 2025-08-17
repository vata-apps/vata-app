import { Database, TablesUpdate } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  nameId: string;
  firstName?: string | null;
  lastName?: string | null;
  surname?: string | null;
  type?: Database["public"]["Enums"]["name_type"];
  isPrimary?: boolean;
}

/**
 * Updates an existing name in the database
 *
 * @param nameId - The unique identifier of the name to update
 * @param firstName - The first name
 * @param lastName - The last name
 * @param surname - The surname
 * @param type - The type of name (birth, marriage, nickname, unknown)
 * @param isPrimary - Whether this is the primary name for the individual
 * @throws {Error} When the database update fails
 */
export async function updateName(params: Params) {
  const { nameId, firstName, lastName, surname, type, isPrimary } = params;

  const update: TablesUpdate<"names"> = {};
  if (firstName !== undefined) update.first_name = firstName;
  if (lastName !== undefined) update.last_name = lastName;
  if (surname !== undefined) update.surname = surname;
  if (type !== undefined) update.type = type;
  if (isPrimary !== undefined) update.is_primary = isPrimary;

  const { error } = await supabase
    .from("names")
    .update(update)
    .eq("id", nameId);

  if (error) throw error;
}
