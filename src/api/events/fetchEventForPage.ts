import { fetchEvent } from "./fetchEvent";

export async function fetchEventForPage(treeId: string, eventId: string) {
  const event = await fetchEvent(treeId, eventId);

  // TODO: fetch sources
  // TODO: fetch medias

  return event;
}
