import { supabase } from "../lib/supabase";
import { getPageRange } from "./getPageRange";

// Define the structure of the place data returned from the API
export type PlaceWithType = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  type_id: string;
  parent_id: string | null;
  place_type: {
    name: string;
  };
  parent?: {
    name: string;
  } | null;
};

/**
 * Fetches a paginated list of places from the database
 * @param params.page - The page number to fetch (1-based)
 * @param params.query - Search query to filter places by name
 * @throws When there's an error fetching data from Supabase
 */
export async function fetchPlaces({
  page,
  query,
}: {
  page: number;
  query: string;
}): Promise<{ data: PlaceWithType[]; total: number }> {
  const { start, end } = getPageRange(page);

  // First, get the places data
  const queryBuilder = supabase
    .from("places")
    .select(
      "id, name, latitude, longitude, type_id, parent_id, place_type:place_types!type_id(name)",
      {
        count: "exact",
      },
    );

  if (query) {
    queryBuilder.ilike("name", `%${query}%`);
  }

  const { count, data, error } = await queryBuilder.range(start, end);

  if (error) throw error;

  // Now let's fetch the parent places separately for places with parent_id
  const placesWithParentIds = data.filter((place) => place.parent_id);

  if (placesWithParentIds.length > 0) {
    const parentIds = placesWithParentIds.map((place) => place.parent_id);

    const { data: parentPlaces, error: parentError } = await supabase
      .from("places")
      .select("id, name")
      .in("id", parentIds);

    if (parentError) {
      console.error("Error fetching parent places:", parentError);
    } else if (parentPlaces) {
      // Create a map of parent IDs to parent places
      const parentMap = new Map();
      parentPlaces.forEach((parent) => {
        parentMap.set(parent.id, parent);
      });

      // Add parent data to each place
      data.forEach((place: any) => {
        if (place.parent_id && parentMap.has(place.parent_id)) {
          place.parent = { name: parentMap.get(place.parent_id).name };
        } else {
          place.parent = null;
        }
      });
    }
  }

  return {
    data: data as unknown as PlaceWithType[],
    total: count || 0,
  };
}
