import { Database, TablesUpdate } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  familyId: string;
  husbandId?: string | null;
  wifeId?: string | null;
  type?: Database["public"]["Enums"]["family_type"];
}

/**
 * Updates an existing family in the database
 *
 * @param familyId - The unique identifier of the family to update
 * @param husbandId - The unique identifier of the husband individual
 * @param wifeId - The unique identifier of the wife individual
 * @param type - The type of family relationship
 * @throws {Error} When the database update fails
 */
export async function updateFamily(params: Params) {
  const { familyId, husbandId, wifeId, type } = params;

  const update: TablesUpdate<"families"> = {};
  if (husbandId !== undefined) update.husband_id = husbandId;
  if (wifeId !== undefined) update.wife_id = wifeId;
  if (type !== undefined) update.type = type;

  const { error } = await supabase
    .from("families")
    .update(update)
    .eq("id", familyId);

  if (error) throw error;
}
