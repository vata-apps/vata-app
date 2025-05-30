import { supabase } from "../../../lib/supabase";

/**
 * Fetches basic individual data with names from the database
 */
export async function fetchIndividualsWithNames() {
  const { data: individuals, error: individualsError } = await supabase.from(
    "individuals",
  ).select(`
      id,
      gender,
      names (
        first_name,
        last_name,
        is_primary
      )
    `);

  if (individualsError) throw individualsError;
  return individuals || [];
}
