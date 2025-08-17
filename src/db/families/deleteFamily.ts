import { supabase } from "@/lib/supabase";

interface Params {
  familyId: string;
}

/**
 * Deletes a family from the database
 *
 * @param familyId - The unique identifier of the family to delete
 * @throws {Error} When the database deletion fails
 */
export async function deleteFamily(params: Params) {
  const { familyId } = params;

  const { error } = await supabase.from("families").delete().eq("id", familyId);

  if (error) throw error;
}
