import { Database, TablesUpdate } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  individualId: string;
  gender?: Database["public"]["Enums"]["gender"];
}

/**
 * Updates an existing individual in the database
 *
 * @param individualId - The unique identifier of the individual to update
 * @param gender - The gender of the individual
 * @throws {Error} When the database update fails
 */
export async function updateIndividual(params: Params) {
  const { individualId, gender } = params;

  const update: TablesUpdate<"individuals"> = {};
  if (gender !== undefined) update.gender = gender;

  const { error } = await supabase
    .from("individuals")
    .update(update)
    .eq("id", individualId);

  if (error) throw error;
}
