import { fetchEvents } from "../events/fetchEvents";
import { fetchFamilies } from "../families/fetchFamilies";
import { fetchParents } from "../families/fetchParents";

import { fetchSiblings } from "../families/fetchSiblings";
import { fetchIndividual } from "./fetchIndividual";
import { formatEventsForIndividual } from "./utils";

export async function fetchIndividualForPage(
  treeId: string,
  individualId: string,
) {
  const individual = await fetchIndividual(treeId, individualId);

  const parents = await fetchParents(treeId, individualId);

  const siblings = await fetchSiblings(treeId, individualId);

  const families = await fetchFamilies(treeId, {
    individualIds: [individualId],
  });

  const events = await fetchEvents(treeId, {
    individualIds: [individualId],
  });

  const eventsParents = await fetchEvents(treeId, {
    eventTypes: ["Death"],
    individualIds: [parents.father?.id, parents.mother?.id].filter(
      (id) => id !== undefined,
    ),
  });

  const eventsChildren = await fetchEvents(treeId, {
    eventTypes: ["Birth", "Death"],
    individualIds: families
      .flatMap((family) => family.children)
      .map((child) => child.id),
  });

  const allEvents = [...events, ...eventsParents, ...eventsChildren];

  return {
    ...individual,
    parents,
    siblings,
    families,
    events: formatEventsForIndividual(allEvents, {
      gender: individual.gender,
      individualId,
    }),
  };
}
