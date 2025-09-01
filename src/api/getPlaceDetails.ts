import { fetchPlaceById, fetchPlaceTypeById } from "@/db";

interface Params {
  placeId: string;
}

export async function getPlaceDetails(params: Params) {
  const { placeId } = params;

  const place = await fetchPlaceById({ placeId });
  if (!place) throw new Error("not_found");

  const placeType = await fetchPlaceTypeById({ placeTypeId: place.typeId });

  return {
    id: place.id,
    gedcomId: place.gedcomId,
    latitude: place.latitude,
    longitude: place.longitude,
    name: place.name,
    placeType: placeType && {
      id: placeType.id,
      key: placeType.key,
      name: placeType.name,
    },
  };
}
