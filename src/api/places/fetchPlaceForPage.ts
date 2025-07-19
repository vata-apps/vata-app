import { fetchEvents } from "../events/fetchEvents";
import { fetchPlace } from "./fetchPlace";
import { fetchPlaceChildren } from "./fetchPlaceChildren";
import { formatEventsForPlace } from "./utils";

export async function fetchPlaceForPage(treeId: string, placeId: string) {
  const place = await fetchPlace(treeId, placeId);
  const events = await fetchEvents(treeId, { placeIds: [placeId] });
  const parent = place.parentId
    ? await fetchPlace(treeId, place.parentId)
    : null;
  const children = await fetchPlaceChildren(treeId, placeId);

  return {
    ...place,
    events: formatEventsForPlace(events),
    parent,
    children,
  };
}
