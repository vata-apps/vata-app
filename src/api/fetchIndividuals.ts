import { Enums, Tables } from "@/database.types";
import { SortConfig } from "@/types/sort";
import { supabase } from "../lib/supabase";
import { fetchIndividualsByName } from "./fetchIndividualsByName";
import { getPageRange } from "./getPageRange";

type Name = Pick<Tables<"names">, "first_name" | "last_name" | "is_primary">;

type NameWithIndividual = {
  first_name: string;
  last_name: string;
  is_primary: boolean;
  individuals: {
    id: string;
    gender: Enums<"gender">;
    names: Name[];
  };
};

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

  // First get the sorted primary names with their individual data
  const { count, data, error } = await supabase
    .from("names")
    .select(
      `
      first_name,
      last_name,
      is_primary,
      individuals!inner (
        id,
        gender,
        names (
          first_name,
          last_name,
          is_primary
        )
      )
    `,
      { count: "exact" },
    )
    .eq("is_primary", true)
    .order(sort?.field ?? "last_name", {
      ascending: sort ? sort.direction === "asc" : true,
    })
    .range(start, end);

  if (error) throw error;

  // Transform the data to match the expected format
  const transformedData = (data as unknown as NameWithIndividual[]).map(
    (item) => ({
      ...item.individuals,
      names: item.individuals.names,
    }),
  );

  return { data: transformedData, total: count };
}
