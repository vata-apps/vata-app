import {
  IconBabyCarriage,
  IconBible,
  IconGrave,
  IconHeartHandshake,
  IconSkull,
} from "@tabler/icons-react";
import { Events } from "../events/fetchEvents";

export function formatEventsForPlace(events: Events) {
  return events
    .map((event) => {
      const commonEvent = {
        id: event.id,
        date: event.date,
        description: event.title,
        place: event.place,
        type: event.type,
      };

      if (event.type.name === "Birth") {
        return {
          ...commonEvent,
          Icon: IconBabyCarriage,
        };
      }

      if (event.type.name === "Death") {
        return {
          ...commonEvent,
          Icon: IconSkull,
        };
      }

      if (event.type.name === "Marriage") {
        return {
          ...commonEvent,
          Icon: IconHeartHandshake,
        };
      }

      if (event.type.name === "Baptism") {
        return {
          ...commonEvent,
          Icon: IconBible,
        };
      }

      if (event.type.name === "Burial") {
        return {
          ...commonEvent,
          Icon: IconGrave,
        };
      }

      return null;
    })
    .filter((event) => event !== null)
    .sort((a, b) => {
      return a.date?.localeCompare(b.date ?? "") ?? 0;
    });
}
