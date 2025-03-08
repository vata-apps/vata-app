import { Database } from "../database.types";
import { supabase } from "../lib/supabase";

type Place = Database["public"]["Tables"]["places"]["Row"];
type PlaceType = Database["public"]["Tables"]["place_types"]["Row"];

// Define a recursive type for the parent hierarchy
type ParentPlace = {
  id: string;
  name: string;
  parent: ParentPlace | null;
};

type PlaceWithType = Place & {
  type: Pick<PlaceType, "name">;
  parent: ParentPlace | null;
};

/**
 * Recursively fetches a place's parent hierarchy
 */
async function fetchParentHierarchy(
  parentId: string,
): Promise<ParentPlace | null> {
  const { data: parentPlace, error } = await supabase
    .from("places")
    .select("id, name, parent_id")
    .eq("id", parentId)
    .single();

  if (error || !parentPlace) {
    console.error("Error fetching parent place:", error);
    return null;
  }

  // If this parent has its own parent, fetch that recursively
  if (parentPlace.parent_id) {
    const grandparent = await fetchParentHierarchy(parentPlace.parent_id);
    return {
      id: parentPlace.id,
      name: parentPlace.name,
      parent: grandparent,
    };
  }

  // No more parents in the hierarchy
  return {
    id: parentPlace.id,
    name: parentPlace.name,
    parent: null,
  };
}

/**
 * Fetches a place by its ID from the database
 * @param id - The ID of the place to fetch
 * @throws When there's an error fetching data from Supabase
 */
export async function fetchPlaceById(
  id: string,
): Promise<PlaceWithType | null> {
  // First, get the place data with its type
  const { data: place, error } = await supabase
    .from("places")
    .select("*, place_type:place_types!type_id(name)")
    .eq("id", id)
    .single();

  if (error) throw error;
  if (!place) return null;

  // If the place has a parent, fetch the complete parent hierarchy
  if (place.parent_id) {
    const parentHierarchy = await fetchParentHierarchy(place.parent_id);

    return {
      ...place,
      type: { name: place.place_type.name },
      parent: parentHierarchy,
    };
  }

  // Return the place without parent info if there's no parent
  return {
    ...place,
    type: { name: place.place_type.name },
    parent: null,
  };
}
