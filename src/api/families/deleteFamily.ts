import { supabase } from "@/lib/supabase";

/**
 * Deletes a family and all associated data
 *
 * This function handles family deletion with the following logic:
 * 1. All family_children will be automatically deleted (CASCADE constraint)
 * 2. The family itself is deleted
 * 3. Individuals are preserved (SET NULL constraint on husband_id and wife_id)
 */
export async function deleteFamily(treeId: string, familyId: string) {
  const { error } = await supabase
    .from("families")
    .delete()
    .eq("id", familyId)
    .eq("tree_id", treeId);

  if (error) throw error;

  return { success: true };
}

export type DeleteFamilyResult = Awaited<ReturnType<typeof deleteFamily>>;
