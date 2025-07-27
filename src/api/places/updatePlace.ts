import { supabase } from "@/lib/supabase";

interface UpdatePlaceData {
  name: string;
  typeId: string;
  parentId?: string;
  latitude?: string;
  longitude?: string;
}

export async function updatePlace(
  treeId: string,
  placeId: string,
  data: UpdatePlaceData,
) {
  const placeData = {
    name: data.name,
    type_id: data.typeId,
    parent_id: data.parentId || null,
    latitude: data.latitude ? parseFloat(data.latitude) : null,
    longitude: data.longitude ? parseFloat(data.longitude) : null,
  };

  const { data: updatedPlace, error } = await supabase
    .from("places")
    .update(placeData)
    .eq("id", placeId)
    .eq("tree_id", treeId)
    .select("id")
    .single();

  if (error) throw error;

  return updatedPlace;
}
