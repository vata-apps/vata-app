import { fetchPlaces } from "./fetchPlaces";

export async function fetchPlace(treeId: string, placeId: string) {
  const places = await fetchPlaces(treeId, { placeIds: [placeId] });

  if (places.length === 0) throw new Error("Place not found");
  if (places.length > 1) throw new Error("Multiple places found");

  return places[0];
}

export type Place = Awaited<ReturnType<typeof fetchPlace>>;
