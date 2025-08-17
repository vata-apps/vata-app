import { supabase } from "@/lib/supabase";

interface Params {
  parentId?: string;
  placeIds?: string[];
}

// TODO: Use fetchPlaces from $db

export async function getPlaces(treeId: string, params?: Params) {
  let query = supabase
    .from("places")
    .select(
      `
        id,
        gedcom_id,
        name,
        latitude,
        longitude,
        parent_id,
        placeType:place_types(id, name)
      `,
    )
    .eq("tree_id", treeId);

  if (params?.placeIds) {
    query = query.in("id", params.placeIds);
  }

  if (params?.parentId) {
    query = query.eq("parent_id", params.parentId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data.map((place) => ({
    id: place.id,
    name: place.name,
    latitude: place.latitude,
    longitude: place.longitude,
    placeType: place.placeType,
    gedcomId: `P-${place.gedcom_id?.toString().padStart(4, "0") ?? "0000"}`,
    parentId: place.parent_id,
  }));
}

export type Places = Awaited<ReturnType<typeof getPlaces>>;
