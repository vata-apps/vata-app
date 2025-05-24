import { SortConfig } from "@/types/sort";
import { supabase } from "../lib/supabase";
import { getPageRange } from "./getPageRange";

/**
 * Helper function to fetch individuals by searching their names
 * @param params.page - The page number to fetch (1-based)
 * @param params.query - Search query to filter individuals by name
 * @param params.sort - Sorting configuration
 * @throws When there's an error fetching data from Supabase
 * @private
 */
export async function fetchIndividualsByName({
  page,
  query,
  sort,
}: {
  page: number;
  query: string;
  sort: SortConfig;
}) {
  const { start, end } = getPageRange(page);

  // First get matching individual IDs
  const { data: matchingIds, error: matchingError } = await supabase
    .from("names")
    .select("individual_id")
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .limit(1000); // Set a reasonable limit

  if (matchingError) throw matchingError;

  if (!matchingIds || matchingIds.length === 0) {
    return { data: [], total: 0 };
  }

  // Get unique individual IDs
  const uniqueIds = [...new Set(matchingIds.map((item) => item.individual_id))];

  // Get primary names first
  const { data: primaryNames, error: primaryError } = await supabase
    .from("names")
    .select("individual_id, first_name, last_name")
    .eq("is_primary", true)
    .in("individual_id", uniqueIds)
    .order(sort?.field ?? "last_name", {
      ascending: sort ? sort.direction === "asc" : true,
    });

  if (primaryError) throw primaryError;

  if (!primaryNames || primaryNames.length === 0) {
    return { data: [], total: 0 };
  }

  // Sort the IDs based on primary names
  const sortedIds = primaryNames.map((name) => name.individual_id);

  // Get the individuals with all their names in the sorted order
  const { data, error } = await supabase
    .from("individuals")
    .select(
      `
      id,
      gender,
      names (
        first_name,
        last_name,
        is_primary
      ),
      individual_events!inner (
        id,
        date,
        type_id,
        place_id,
        places (
          id,
          name
        ),
        individual_event_types (
          id,
          name
        )
      )
    `,
    )
    .in("id", sortedIds);

  if (error) throw error;

  // Ensure the data is in the same order as sortedIds
  const sortedData = sortedIds
    .map((id) => data?.find((individual) => individual.id === id))
    .filter(Boolean);

  return {
    data: sortedData.slice(start, end),
    total: uniqueIds.length,
  };
}
