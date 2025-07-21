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

      if (event.type.key === "birth") {
        return {
          ...commonEvent,
          Icon: IconBabyCarriage,
        };
      }

      if (event.type.key === "death") {
        return {
          ...commonEvent,
          Icon: IconSkull,
        };
      }

      if (event.type.key === "marriage") {
        return {
          ...commonEvent,
          Icon: IconHeartHandshake,
        };
      }

      if (event.type.key === "baptism") {
        return {
          ...commonEvent,
          Icon: IconBible,
        };
      }

      if (event.type.key === "burial") {
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
