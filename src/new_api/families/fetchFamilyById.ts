import { supabase } from "@/lib/supabase";

interface Params {
  familyId: string;
}

/**
 * Fetches a single family by its ID
 *
 * @param familyId - The unique identifier of the family
 * @returns Promise that resolves to the family data or null if not found
 * @throws {Error} When the database query fails
 */
export async function fetchFamilyById(params: Params) {
  const { familyId } = params;

  const { data: family, error } = await supabase
    .from("families")
    .select("*")
    .eq("id", familyId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows returned
    throw error;
  }

  return family;
}
