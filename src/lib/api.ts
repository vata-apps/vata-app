import { Tables } from "../../supabase/database.types";
import { supabase } from "./supabase";

/**
 * Fetches all individuals from the database
 *
 * @throws Error if there's a problem with the database query
 */
export async function fetchIndividuals() {
  const { data, error } = await supabase
    .from("individuals")
    .select("id, gender, gedcom_id");

  if (error) {
    console.error("Error fetching individuals:", error);
    throw error;
  }

  return data as Tables<"individuals">[];
}

/**
 * Fetches a single individual by their ID, including their associated names
 *
 * @param id The unique identifier of the individual
 * @throws Error if the individual doesn't exist or there's a database error
 *
 * @example
 * // Get individual with ID "123"
 * const individual = await fetchIndividualById("123");
 */
export async function fetchIndividualById(id: string) {
  const { data, error } = await supabase
    .from("individuals")
    .select("id, gender, gedcom_id, names(first_name, last_name, is_primary)")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching individual with ID ${id}:`, error);
    throw error;
  }

  return data;
}

export async function fetchIndividualsWithNames(page: number, ipp: number) {
  const start = (page - 1) * ipp;
  const end = start + ipp - 1;

  const { data, error, count } = await supabase
    .from("individuals")
    .select(
      `
      id,
      gender,
      gedcom_id,
      names(first_name, last_name, is_primary)
    `,
      { count: "exact" },
    )
    .range(start, end);

  if (error) {
    console.error("Error fetching individuals with names:", error);
    throw error;
  }

  return { data, total: count || 0 };
}
