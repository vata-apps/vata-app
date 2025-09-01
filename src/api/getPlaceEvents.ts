import { fetchEventRoles, fetchEventsByPlaceId, fetchEventTypes } from "@/db";

interface Params {
  placeId: string;
  treeId: string;
}

export async function getPlaceEvents(params: Params) {
  const { placeId, treeId } = params;

  const [events, eventTypes, eventRoles] = await Promise.all([
    fetchEventsByPlaceId({ placeId }),
    fetchEventTypes({ treeId }),
    fetchEventRoles({ treeId }),
  ]);

  const eventIds = events.map((event) => event.id);

  console.log("events", events);
  console.log("eventIds", eventIds);
  console.log("eventTypes", eventTypes);
  console.log("eventRoles", eventRoles);

  return events.map(({ id, date, description, gedcomId, typeId }) => {
    const type = eventTypes.find((type) => type.id === typeId);

    return {
      id,
      date,
      description,
      gedcomId,
      type,
      subjects: [],
    };
  });
}
