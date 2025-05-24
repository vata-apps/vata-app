import { FamilyWithRelations } from "@/components/family/types";
import { supabase } from "@/lib/supabase";
import { FamilySortField, SortConfig } from "@/types/sort";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { getPageRange } from "./getPageRange";

type FamilyResponse = PostgrestSingleResponse<FamilyWithRelations[]>;

/**
 * Builds the search filter for family queries
 */
function buildSearchFilter(query: string) {
  return [
    `searchable_names.ilike.%${query}%`,
    `husband_first_name.ilike.%${query}%`,
    `husband_last_name.ilike.%${query}%`,
    `wife_first_name.ilike.%${query}%`,
    `wife_last_name.ilike.%${query}%`,
  ].join(",");
}

/**
 * Fetches a paginated list of families from the database with server-side sorting and filtering
 * Uses the family_sorting_view for efficient sorting and filtering, then fetches complete data
 * @param params.page - The page number to fetch (1-based)
 * @param params.query - Optional search query to filter families by member name
 * @param params.sort - Optional sorting configuration
 * @throws When there's an error fetching data from Supabase
 */
export async function fetchFamilies({
  page,
  query,
  sort,
}: {
  page: number;
  query?: string;
  sort?: SortConfig<FamilySortField>;
}): Promise<{ data: FamilyWithRelations[]; total: number }> {
  const { start, end } = getPageRange(page);

  // Step 1: Get total count for pagination
  let countQuery = supabase
    .from("family_sorting_view")
    .select("id", { count: "exact", head: true });

  if (query) {
    countQuery = countQuery.or(buildSearchFilter(query));
  }

  const { count: totalCount, error: countError } = await countQuery;

  if (countError) throw countError;

  // Step 2: Build and execute sorted query for family IDs
  let sortedQuery = supabase.from("family_sorting_view").select("id");

  // Apply search filter
  if (query) {
    sortedQuery = sortedQuery.or(buildSearchFilter(query));
  }

  // Apply sorting
  if (sort) {
    const { field, direction } = sort;
    sortedQuery = sortedQuery.order(field, { ascending: direction === "asc" });
  } else {
    // Default sorting by husband's last name
    sortedQuery = sortedQuery.order("husband_last_name", { ascending: true });
  }

  // Get sorted and paginated family IDs
  const { data: sortedFamilyIds, error: sortingError } =
    await sortedQuery.range(start, end - 1);

  if (sortingError) throw sortingError;

  if (!sortedFamilyIds || sortedFamilyIds.length === 0) {
    return { data: [], total: totalCount || 0 };
  }

  // Step 3: Fetch complete family data for the sorted IDs
  const familyIds = sortedFamilyIds.map((item) => item.id!);

  const { data: families, error: familiesError } = (await supabase
    .from("families")
    .select(
      `
      id,
      type,
      husband:individuals!families_husband_id_fkey(
        id,
        gender,
        names(first_name, last_name, is_primary)
      ),
      wife:individuals!families_wife_id_fkey(
        id,
        gender,
        names(first_name, last_name, is_primary)
      ),
      children:family_children!family_children_family_id_fkey(
        individual:individuals(
          id,
          gender,
          names(first_name, last_name, is_primary)
        )
      )
    `,
    )
    .in("id", familyIds)) as FamilyResponse;

  if (familiesError) throw familiesError;

  if (!families) return { data: [], total: totalCount || 0 };

  // Step 4: Maintain the sorted order from the view query
  const sortedFamilies = familyIds
    .map((id) => families.find((family) => family.id === id))
    .filter((family): family is FamilyWithRelations => family !== undefined);

  return {
    data: sortedFamilies,
    total: totalCount || 0,
  };
}
