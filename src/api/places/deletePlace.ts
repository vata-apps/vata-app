import { supabase } from "@/lib/supabase";

/**
 * Deletes a place and handles related data
 *
 * This function handles place deletion with the following logic:
 * 1. Child places will have their parent_id set to null (handled by foreign key constraint)
 * 2. Events that reference this place will have their place_id set to null (handled by foreign key constraint)
 * 3. The place itself is deleted
 */
export async function deletePlace(treeId: string, placeId: string) {
  const { error } = await supabase
    .from("places")
    .delete()
    .eq("id", placeId)
    .eq("tree_id", treeId);

  if (error) throw error;

  return { success: true };
}

export type DeletePlaceResult = Awaited<ReturnType<typeof deletePlace>>;
