import { supabase } from "../lib/supabase";

type PlaceWithType = {
  id: string;
  name: string;
  type: {
    name: string;
  };
  created_at: string;
};

/**
 * Fetches all places that have the specified place as their parent
 * @param parentId - The ID of the parent place
 * @throws When there's an error fetching data from Supabase
 */
export async function fetchChildPlaces(
  parentId: string,
): Promise<PlaceWithType[]> {
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

    if (typeIds.length === 0) {
      // If no type IDs, return places with unknown type
      return data.map((place) => ({
        id: place.id,
        name: place.name,
        type: { name: "unknown" },
        created_at: place.created_at,
      }));
    }

    const { data: typeData, error: typeError } = await supabase
      .from("place_types")
      .select("id, name")
      .in("id", typeIds);

    if (typeError) throw typeError;

    // Create a map of type IDs to type names
    const typeMap = new Map();
    if (typeData) {
      typeData.forEach((type) => {
        typeMap.set(type.id, type.name);
      });
    }

    // Transform the data to match our expected format
    return data.map((place) => ({
      id: place.id,
      name: place.name,
      type: {
        name:
          place.type_id && typeMap.has(place.type_id)
            ? typeMap.get(place.type_id)
            : "unknown",
      },
      created_at: place.created_at,
    }));
  } catch (error) {
    console.error("Error fetching child places:", error);
    throw error;
  }
}
