import { fetchEvents } from "../events/fetchEvents";
import { formatEventsForPlace } from "../places/utils";
import { fetchFamily } from "./fetchFamily";

export async function fetchFamilyForPage(treeId: string, familyId: string) {
  const family = await fetchFamily(treeId, familyId);

  const parentIndividualIds = [family.husband?.id, family.wife?.id].filter(
    (id) => id !== undefined,
  );

  const childrenIndividualIds = family.children.map((child) => child.id);

  const parentsEvents = await fetchEvents(treeId, {
    eventTypes: ["death", "marriage"],
    individualIds: parentIndividualIds,
  });

  const childrenEvents = await fetchEvents(treeId, {
    eventTypes: ["birth", "death"],
    individualIds: childrenIndividualIds,
  });

  const allEvents = [...parentsEvents, ...childrenEvents];

  return {
    id: family.id,
    gedcomId: family.gedcomId,
    husband: family.husband,
    wife: family.wife,
    children: family.children,
    events: formatEventsForPlace(allEvents),
  };
}
