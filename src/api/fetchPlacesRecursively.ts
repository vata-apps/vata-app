import { supabase } from "../lib/supabase";

export type RecursivePlaceWithType = {
  id: string;
  name: string;
  type: {
    name: string;
  };
  created_at: string;
  children: RecursivePlaceWithType[];
  level: number;
};

/**
 * Fetches all places that have the specified place as their parent, recursively
 * @param parentId - The ID of the parent place
 * @param level - The current nesting level (used for indentation)
 * @throws When there's an error fetching data from Supabase
 */
export async function fetchPlacesRecursively(
  parentId: string,
  level = 0,
): Promise<RecursivePlaceWithType[]> {
  try {
    // Get all places that have the specified place as their parent
    const { data, error } = await supabase
      .from("places")
      .select("id, name, created_at, type_id")
      .eq("parent_id", parentId)
      .order("name");

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Get all the place types in a separate query
    const typeIds = data.map((place) => place.type_id).filter(Boolean);

    const typeMap = new Map();
    if (typeIds.length > 0) {
      const { data: typeData, error: typeError } = await supabase
        .from("place_types")
        .select("id, name")
        .in("id", typeIds);

      if (typeError) throw typeError;

      // Create a map of type IDs to type names
      if (typeData) {
        typeData.forEach((type) => {
          typeMap.set(type.id, type.name);
        });
      }
    }

    // Transform the data to match our expected format
    const places = data.map((place) => ({
      id: place.id,
      name: place.name,
      type: {
        name:
          place.type_id && typeMap.has(place.type_id)
            ? typeMap.get(place.type_id)
            : "unknown",
      },
      created_at: place.created_at,
      children: [] as RecursivePlaceWithType[],
      level,
    }));

    // Recursively fetch children for each place
    for (const place of places) {
      place.children = await fetchPlacesRecursively(place.id, level + 1);
    }

    return places;
  } catch (error) {
    console.error("Error fetching places recursively:", error);
    throw error;
  }
}

/**
 * Flattens a recursive place structure into a flat array for display
 * @param places - The recursive place structure
 * @returns A flat array of places with level information
 */
export function flattenPlaces(
  places: RecursivePlaceWithType[],
): RecursivePlaceWithType[] {
  const result: RecursivePlaceWithType[] = [];

  for (const place of places) {
    result.push(place);
    if (place.children.length > 0) {
      result.push(...flattenPlaces(place.children));
    }
  }

  return result;
}
