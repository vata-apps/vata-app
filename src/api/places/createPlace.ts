import { supabase } from "@/lib/supabase";

interface CreatePlaceData {
  name: string;
  typeId: string;
  parentId?: string;
  latitude?: string;
  longitude?: string;
}

export async function createPlace(treeId: string, data: CreatePlaceData) {
  const placeData = {
    name: data.name,
    type_id: data.typeId,
    parent_id: data.parentId || null,
    latitude: data.latitude ? parseFloat(data.latitude) : null,
    longitude: data.longitude ? parseFloat(data.longitude) : null,
    tree_id: treeId,
  };

  const { data: newPlace, error } = await supabase
    .from("places")
    .insert(placeData)
    .select("id")
    .single();

  if (error) throw error;

  return newPlace;
}

export type CreatePlaceResult = Awaited<ReturnType<typeof createPlace>>;
