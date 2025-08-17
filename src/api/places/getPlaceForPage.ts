import { fetchEvents } from "../events/fetchEvents";
import { getPlace } from "./getPlace";
import { getPlaceChildren } from "./getPlaceChildren";
import { formatEventsForPlace } from "./utils";

export async function getPlaceForPage(treeId: string, placeId: string) {
  const place = await getPlace(treeId, placeId);
  const events = await fetchEvents(treeId, { placeIds: [placeId] });
  const parent = place.parentId ? await getPlace(treeId, place.parentId) : null;
  const children = await getPlaceChildren(treeId, placeId);

  return {
    ...place,
    events: formatEventsForPlace(events),
    parent,
    children,
  };
}
