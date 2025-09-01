import { fetchPlaceById, fetchPlaceTypeById } from "@/db";
import { fetchPlacesByParentId } from "@/db/places/fetchPlacesByParentId";
import { getEventsByPlaceId } from "../getEventsByPlaceId";
import { formatEventsForPlace } from "./utils";

interface Params {
  placeId: string;
  treeId: string;
}

export async function getPlaceForPage(params: Params) {
  const { placeId, treeId } = params;

  const place = await fetchPlaceById({ placeId });
  if (!place) throw new Error("not_found");

  const placeType = await fetchPlaceTypeById({ placeTypeId: place.typeId });

  const events = await getEventsByPlaceId({ placeId, treeId });

  const parent = await (async () => {
    if (!place?.parentId) return null;
    return fetchPlaceById({ placeId: place.parentId });
  })();

  const children = (() => {
    if (!place?.parentId) return [];
    return fetchPlacesByParentId({ parentId: place.parentId });
  })();

  return {
    gedcomId: place.gedcomId,
    latitude: place.latitude,
    longitude: place.longitude,
    name: place.name,
    placeType,
    events: formatEventsForPlace(events),
    parent,
    children,
  };
}
