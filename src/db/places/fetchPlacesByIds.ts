import { supabase } from "@/lib/supabase";
import { select } from "./utils";

interface Params {
  placeIds: string[];
}

export async function fetchPlacesByIds(params: Params) {
  const { placeIds } = params;

  const { data: places, error } = await supabase
    .from("places")
    .select(select)
    .in("id", placeIds);

  if (error) throw error;

  return places;
}
