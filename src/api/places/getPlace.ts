import { getPlaces } from "./getPlaces";

export async function getPlace(treeId: string, placeId: string) {
  const places = await getPlaces(treeId, { placeIds: [placeId] });

  if (places.length === 0) throw new Error("not_found");
  if (places.length > 1) throw new Error("multiple_found");

  return places[0];
}

export type Place = Awaited<ReturnType<typeof getPlace>>;
