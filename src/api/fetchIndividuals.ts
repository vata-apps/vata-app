import { SortConfig } from "@/types/sort";
import { supabase } from "../lib/supabase";
import { fetchIndividualsByName } from "./fetchIndividualsByName";
import { getPageRange } from "./getPageRange";

/**
 * Fetches a paginated list of individuals from the database
 * @param params.page - The page number to fetch (1-based)
 * @param params.query - Search query to filter individuals by name
 * @param params.sort - Sorting configuration
 * @throws When there's an error fetching data from Supabase
 */
export async function fetchIndividuals({
  page,
  query,
  sort,
}: {
  page: number;
  query: string;
  sort: SortConfig;
}) {
  const { start, end } = getPageRange(page);

  if (query) return await fetchIndividualsByName({ page, query, sort });

  // Get all individuals with their names and events
  const {
    count,
    data: individuals,
    error: individualsError,
  } = await supabase.from("individuals").select(
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
    { count: "exact" },
  );

  if (individualsError) throw individualsError;

  // Sort the data if needed
  const sortedData = sort
    ? [...individuals].sort((a, b) => {
        const aPrimaryName = a.names.find((n) => n.is_primary);
        const bPrimaryName = b.names.find((n) => n.is_primary);

        if (!aPrimaryName || !bPrimaryName) return 0;

        const aValue =
          sort.field === "first_name"
            ? aPrimaryName.first_name
            : aPrimaryName.last_name;
        const bValue =
          sort.field === "first_name"
            ? bPrimaryName.first_name
            : bPrimaryName.last_name;

        const comparison = aValue.localeCompare(bValue);
        return sort.direction === "asc" ? comparison : -comparison;
      })
    : individuals;

  // Apply pagination
  const paginatedData = sortedData.slice(start, end);

  return { data: paginatedData, total: count };
}
