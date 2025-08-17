import { supabase } from "@/lib/supabase";

interface Params {
  familyId: string;
}

/**
 * Fetches all children for a specific family
 *
 * @param familyId - The unique identifier of the family
 * @returns Promise that resolves to an array of all family children relationships
 * @throws {Error} When the database query fails
 */
export async function fetchFamilyChildren(params: Params) {
  const { familyId } = params;

  const { data: familyChildren, error } = await supabase
    .from("family_children")
    .select("*")
    .eq("family_id", familyId)
    .order("created_at");

  if (error) throw error;

  return familyChildren;
}
