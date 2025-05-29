import { SortConfig } from "@/types/sort";
import { getPageRange } from "../getPageRange";
import { fetchAllIndividuals } from "./fetchAll";
import { filterIndividuals } from "./filter";
import { sortIndividuals } from "./sort";
import type { IndividualFilters } from "./types";

/**
 * Fetches a paginated list of individuals with client-side filtering, sorting, and pagination
 * @param params.page - The page number to fetch (1-based)
 * @param params.query - Optional search query to filter individuals by name
 * @param params.sort - Optional sorting configuration
 * @param params.filters - Optional filters for events, families, etc.
 * @throws When there's an error fetching data from Supabase
 */
export async function fetchIndividuals({
  page,
  query,
  sort,
  filters,
}: {
  page: number;
  query?: string;
  sort?: SortConfig;
  filters?: IndividualFilters;
}) {
  // Fetch all individuals (uses cache after first call)
  const allIndividuals = await fetchAllIndividuals();

  // Apply filters
  const filteredIndividuals = await filterIndividuals(
    allIndividuals,
    query,
    filters,
  );

  // Apply sorting
  const sortedIndividuals = sortIndividuals(filteredIndividuals, sort);

  // Apply pagination
  const { start, end } = getPageRange(page);
  const paginatedIndividuals = sortedIndividuals.slice(start, end);

  return {
    data: paginatedIndividuals,
    total: sortedIndividuals.length,
  };
}

// Re-export utility functions and types
export { clearIndividualsCache } from "./fetchAll";
export type { Individual, IndividualFilters } from "./types";
