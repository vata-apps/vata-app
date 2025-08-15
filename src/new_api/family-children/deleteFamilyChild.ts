import { supabase } from "@/lib/supabase";

interface Params {
  familyChildId: string;
}

/**
 * Deletes a family child relationship from the database
 *
 * @param familyChildId - The unique identifier of the family child relationship to delete
 * @throws {Error} When the database deletion fails
 */
export async function deleteFamilyChild(params: Params) {
  const { familyChildId } = params;

  const { error } = await supabase
    .from("family_children")
    .delete()
    .eq("id", familyChildId);

  if (error) throw error;
}
