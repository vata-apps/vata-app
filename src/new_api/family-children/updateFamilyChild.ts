import { TablesUpdate } from "@/database.types";
import { supabase } from "@/lib/supabase";

interface Params {
  familyChildId: string;
  familyId?: string;
  individualId?: string;
}

/**
 * Updates an existing family child relationship in the database
 *
 * @param familyChildId - The unique identifier of the family child relationship to update
 * @param familyId - The unique identifier of the family
 * @param individualId - The unique identifier of the individual (child)
 * @throws {Error} When the database update fails
 */
export async function updateFamilyChild(params: Params) {
  const { familyChildId, familyId, individualId } = params;

  const update: TablesUpdate<"family_children"> = {};
  if (familyId !== undefined) update.family_id = familyId;
  if (individualId !== undefined) update.individual_id = individualId;

  const { error } = await supabase
    .from("family_children")
    .update(update)
    .eq("id", familyChildId);

  if (error) throw error;
}
