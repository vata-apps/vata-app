import { fetchEvents } from "./fetchEvents";

export async function fetchEvent(treeId: string, eventId: string) {
  const events = await fetchEvents(treeId, { eventIds: [eventId] });

  if (events.length === 0) throw new Error("Event not found");
  if (events.length > 1) throw new Error("Multiple events found");

  return events[0];
}

export type Event = Awaited<ReturnType<typeof fetchEvent>>;
