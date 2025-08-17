import { supabase } from "@/lib/supabase";

interface Params {
  familyChildId: string;
}

/**
 * Fetches a single family child relationship by its ID
 *
 * @param familyChildId - The unique identifier of the family child relationship
 * @returns Promise that resolves to the family child data or null if not found
 * @throws {Error} When the database query fails
 */
export async function fetchFamilyChildById(params: Params) {
  const { familyChildId } = params;

  const { data: familyChild, error } = await supabase
    .from("family_children")
    .select("*")
    .eq("id", familyChildId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows returned
    throw error;
  }

  return familyChild;
}
