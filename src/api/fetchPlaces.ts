import { PostgrestResponse } from "@supabase/supabase-js";
import { Database } from "../database.types";
import { supabase } from "../lib/supabase";
import { getPageRange } from "./getPageRange";

type Place = Database["public"]["Tables"]["places"]["Row"];
type PlaceType = Database["public"]["Tables"]["place_types"]["Row"];

type PlaceResponse = Place & {
  place_type: Pick<PlaceType, "name">;
};

export type PlaceWithType = PlaceResponse & {
  parent?: Pick<Place, "name"> | null;
};

type PlacesResponse = PostgrestResponse<PlaceResponse>;

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
    .select("*, place_type:place_types!type_id(name)", {
      count: "exact",
    });

  if (query) {
    queryBuilder.ilike("name", `%${query}%`);
  }

  const response = (await queryBuilder.range(start, end)) as PlacesResponse;

  const { count, data, error } = response;

  if (error) throw error;
  if (!data) return { data: [], total: 0 };

  const places = data;

  // Now let's fetch the parent places separately for places with parent_id
  const placesWithParentIds = places.filter(
    (place): place is PlaceResponse & { parent_id: string } =>
      place.parent_id !== null,
  );

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
      const parentMap = new Map<string, Pick<Place, "name">>();
      parentPlaces.forEach((parent) => {
        parentMap.set(parent.id, { name: parent.name });
      });

      // Add parent data to each place
      const placesWithParents = places.map((place) => ({
        ...place,
        parent:
          place.parent_id && parentMap.has(place.parent_id)
            ? parentMap.get(place.parent_id) || null
            : null,
      }));

      return {
        data: placesWithParents,
        total: count || 0,
      };
    }
  }

  // If no parent places to fetch or error fetching parents, return places without parent info
  return {
    data: places.map((place) => ({ ...place, parent: null })),
    total: count || 0,
  };
}
