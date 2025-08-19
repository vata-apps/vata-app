import { fetchPlaceTypes, fetchPlaces } from "@/db";

interface Params {
  parentId?: string;
  placeIds?: string[];
  treeId: string;
}

export async function getPlaces(params: Params) {
  const { parentId, placeIds, treeId } = params;

  const places = await fetchPlaces({ treeId, filters: { parentId, placeIds } });
  const placeTypes = await fetchPlaceTypes({ treeId });

  const placeTypeMap = new Map(
    placeTypes.map((placeType) => [placeType.id, placeType]),
  );

  return places.map((place) => ({
    id: place.id,
    gedcomId: `P-${place.gedcom_id?.toString().padStart(4, "0") ?? "0000"}`,
    latitude: place.latitude,
    longitude: place.longitude,
    name: place.name,
    parentId: place.parent_id,
    placeType: placeTypeMap.get(place.type_id),
  }));
}

export type Places = Awaited<ReturnType<typeof getPlaces>>;
