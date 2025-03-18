import { Enums, Tables } from "@/database.types";
import { SortConfig } from "@/types/sort";
import { supabase } from "../lib/supabase";
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

  // Get sorted names with their individual data
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
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .order(sort?.field ?? "last_name", {
      ascending: sort ? sort.direction === "asc" : true,
    })
    .range(start, end);

  if (error) throw error;

  // If no individuals found, return empty result
  if (data.length === 0) {
    return { data: [], total: 0 };
  }

  // Transform the data to match the expected format
  const transformedData = (data as unknown as NameWithIndividual[]).map(
    (item) => ({
      ...item.individuals,
      names: item.individuals.names,
    }),
  );

  return { data: transformedData, total: count };
}
