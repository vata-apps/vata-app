import { supabase } from "@/lib/supabase";

interface Params {
  nameId: string;
}

/**
 * Fetches a single name by its ID
 *
 * @param nameId - The unique identifier of the name
 * @returns Promise that resolves to the name data or null if not found
 * @throws {Error} When the database query fails
 */
export async function fetchNameById(params: Params) {
  const { nameId } = params;

  const { data: name, error } = await supabase
    .from("names")
    .select("*")
    .eq("id", nameId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows returned
    throw error;
  }

  return name;
}
