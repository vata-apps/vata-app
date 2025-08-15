import { supabase } from "@/lib/supabase";

interface Params {
  individualId: string;
}

/**
 * Fetches a single individual by its ID
 *
 * @param individualId - The unique identifier of the individual
 * @returns Promise that resolves to the individual data or null if not found
 * @throws {Error} When the database query fails
 */
export async function fetchIndividualById(params: Params) {
  const { individualId } = params;

  const { data: individual, error } = await supabase
    .from("individuals")
    .select("*")
    .eq("id", individualId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows returned
    throw error;
  }

  return individual;
}
