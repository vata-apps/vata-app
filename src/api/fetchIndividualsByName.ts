import { supabase } from "@/lib/supabase";
import { getPageRange } from "./getPageRange";

/**
 * Helper function to fetch individuals by searching their names
 * @param params.page - The page number to fetch (1-based)
 * @param params.query - Search query to filter individuals by name
 * @throws When there's an error fetching data from Supabase
 * @private
 */
export async function fetchIndividualsByName({
  page,
  query,
}: {
  page: number;
  query: string;
}) {
  const { start, end } = getPageRange(page);

  const namesQuery = await supabase
    .from("names")
    .select("first_name, last_name, individual_id")
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .range(start, end);

  if (namesQuery.error) throw namesQuery.error;

  const individualIds = namesQuery.data.map((name) => name.individual_id);

  // If no individuals found, return empty result
  if (individualIds.length === 0) {
    return { data: [], total: 0 };
  }

  const { count, data, error } = await supabase
    .from("individuals")
    .select("id, gender, names(first_name, last_name, is_primary)", {
      count: "exact",
    })
    .in("id", individualIds)
    .range(start, end);

  if (error) throw error;

  return { data, total: count };
}
