import {
  fetchEventParticipantsByEventIds,
  fetchEventRoles,
  fetchEventsByPlaceId,
  fetchEventTypes,
  fetchPlacesByIds,
} from "@/db";
import { getIndividuals } from "./getIndividuals";
import { formatGedcomId } from "./utils/formatGedcomId";

interface Params {
  placeId: string;
  treeId: string;
}

export async function getEventsByPlaceId(params: Params) {
  const { placeId, treeId } = params;

  const [events, eventRoles, eventTypes] = await Promise.all([
    fetchEventsByPlaceId({ placeId }),
    fetchEventRoles({ treeId }),
    fetchEventTypes({ treeId }),
  ]);

  const eventsParticipants = await fetchEventParticipantsByEventIds({
    eventIds: events.map((event) => event.id),
  });
  const eventsParticipantsIndividualIds = eventsParticipants.map(
    ({ individual_id }) => individual_id,
  );

  const individuals = await getIndividuals({
    individualIds: eventsParticipantsIndividualIds,
  });

  const eventPlaces = await fetchPlacesByIds({
    placeIds: events
      .map((event) => event.place_id)
      .filter((placeId) => placeId !== null),
  });

  return events.map(({ id, date, description, ...event }) => {
    const gedcomId = formatGedcomId({ id: event.gedcom_id, module: "events" });
    const eventParticipants = eventsParticipants.filter(
      ({ event_id }) => event_id === id,
    );

    const participants = eventParticipants.map(({ individual_id, role_id }) => {
      const individual = individuals.find(({ id }) => id === individual_id);

      if (!individual) return null;

      return {
        ...individual,
        role: eventRoles.find((role) => role.id === role_id),
      };
    });

    const place = eventPlaces.find((place) => place.id === event.place_id);
    const type = eventTypes.find((type) => type.id === event.type_id);

    return {
      id,
      date,
      description,
      gedcomId,
      participants,
      place,
      title: "", // TODO: getEventTitle({ event, participants }),
      type,
    };
  });
}

export type GetEventsByPlaceId = Awaited<ReturnType<typeof getEventsByPlaceId>>;
