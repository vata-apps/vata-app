import { SortConfig } from "@/types/sort";
import { supabase } from "../lib/supabase";
import { getPageRange } from "./getPageRange";

/**
 * Fetches a paginated list of individuals from the database with server-side sorting and filtering
 * @param params.page - The page number to fetch (1-based)
 * @param params.query - Optional search query to filter individuals by name
 * @param params.sort - Optional sorting configuration
 * @throws When there's an error fetching data from Supabase
 */
export async function fetchIndividuals({
  page,
  query,
  sort,
}: {
  page: number;
  query?: string;
  sort?: SortConfig;
}) {
  const { start, end } = getPageRange(page);

  // Step 1: If there's a search query, get matching individual IDs first
  let matchingIds: string[] | null = null;

  if (query) {
    const { data: matchingData, error: matchingError } = await supabase
      .from("names")
      .select("individual_id")
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`);

    if (matchingError) throw matchingError;

    if (!matchingData || matchingData.length === 0) {
      return { data: [], total: 0 };
    }

    matchingIds = [...new Set(matchingData.map((item) => item.individual_id))];
  }

  // Step 2: Build base query for primary names
  let baseQuery = supabase
    .from("names")
    .select("individual_id, first_name, last_name")
    .eq("is_primary", true);

  if (matchingIds) {
    baseQuery = baseQuery.in("individual_id", matchingIds);
  }

  // Step 3: Get total count for pagination
  let countQuery = supabase
    .from("names")
    .select("individual_id", { count: "exact" })
    .eq("is_primary", true);

  if (matchingIds) {
    countQuery = countQuery.in("individual_id", matchingIds);
  }

  const { count: totalCount, error: countError } = await countQuery;

  if (countError) throw countError;

  // Step 4: Apply server-side sorting and pagination
  const sortField = sort?.field ?? "last_name";
  const sortDirection = sort?.direction ?? "asc";

  const { data: primaryNames, error: primaryError } = await baseQuery
    .order(sortField, { ascending: sortDirection === "asc" })
    .range(start, end - 1);

  if (primaryError) throw primaryError;

  if (!primaryNames || primaryNames.length === 0) {
    return { data: [], total: totalCount || 0 };
  }

  // Step 5: Get full individual data for the paginated and sorted IDs
  const sortedIds = primaryNames.map((name) => name.individual_id);

  const { data: individuals, error: individualsError } = await supabase
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
      individual_events (
        id,
        date,
        type_id,
        place_id,
        places!individual_events_place_id_fkey (
          id,
          name
        ),
        individual_event_types!individual_events_type_id_fkey (
          id,
          name
        )
      )
    `,
    )
    .in("id", sortedIds);

  if (individualsError) throw individualsError;

  // Maintain the sorted order from the primary names query
  const sortedData = sortedIds
    .map((id) => individuals?.find((individual) => individual.id === id))
    .filter(Boolean);

  return {
    data: sortedData,
    total: totalCount || 0,
  };
}
