import { supabase } from "../lib/supabase";

/**
 * Number of items to display per page
 */
const ITEMS_PER_PAGE = 10;

/**
 * Calculates the start and end indices for pagination
 * @param page - The page number (1-based)
 * @returns Object containing start and end indices for the requested page
 * @example
 * // Returns { start: 0, end: 10 } for page 1
 * getPageRange(1)
 * @private
 */
function getPageRange(page: number) {
  return {
    start: (page - 1) * ITEMS_PER_PAGE,
    end: page * ITEMS_PER_PAGE,
  };
}

/**
 * Helper function to fetch individuals by searching their names
 * @param params.page - The page number to fetch (1-based)
 * @param params.query - Search query to filter individuals by name
 * @throws When there's an error fetching data from Supabase
 * @private
 */
async function fetchIndividualsByName({
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
    .ilike("first_name_last_name", `%${query}%`)
    .range(start, end);

  if (namesQuery.error) throw namesQuery.error;

  const individualIds = namesQuery.data.map((name) => name.individual_id);

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

/**
 * Fetches a paginated list of individuals from the database
 * @param params.page - The page number to fetch (1-based)
 * @param params.query - Search query to filter individuals by name
 * @throws When there's an error fetching data from Supabase
 */
export async function fetchIndividuals({
  page,
  query,
}: {
  page: number;
  query: string;
}) {
  const { start, end } = getPageRange(page);

  if (query) return await fetchIndividualsByName({ page, query });

  const { count, data, error } = await supabase
    .from("individuals")
    .select("id, gender, names(first_name, last_name, is_primary)", {
      count: "exact",
    })
    .range(start, end);

  if (error) throw error;

  return { data, total: count };
}
