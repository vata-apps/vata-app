import { getPlaces } from "./getPlaces";

export async function getPlaceChildren(treeId: string, placeId: string) {
  const places = await getPlaces(treeId, { parentId: placeId });
  return places;
}

export type PlaceChildren = Awaited<ReturnType<typeof getPlaceChildren>>;
