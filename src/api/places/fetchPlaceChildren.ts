import { fetchPlaces } from "./fetchPlaces";

export async function fetchPlaceChildren(treeId: string, placeId: string) {
  const places = await fetchPlaces(treeId, { parentId: placeId });
  return places;
}

export type PlaceChildren = Awaited<ReturnType<typeof fetchPlaceChildren>>;
