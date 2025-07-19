import displayName from "@/utils/displayName";
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
        place: event.place,
        type: event.type,
      };

      if (event.type === "Birth") {
        const subject = event.participants.find(
          (participant) => participant.role === "Subject",
        );

        return {
          ...commonEvent,
          description: `Birth of ${displayName(subject)}`,
          Icon: IconBabyCarriage,
        };
      }

      if (event.type === "Death") {
        const deceased = event.participants.find(
          (participant) => participant.role === "Deceased",
        );

        return {
          ...commonEvent,
          description: `Death of ${displayName(deceased)}`,
          Icon: IconSkull,
        };
      }

      if (event.type === "Marriage") {
        const husband = event.participants.find(
          (participant) => participant.role === "Husband",
        );

        const wife = event.participants.find(
          (participant) => participant.role === "Wife",
        );

        return {
          ...commonEvent,
          description: `Marriage of ${displayName(husband)} and ${displayName(wife)}`,
          Icon: IconHeartHandshake,
        };
      }

      if (event.type === "Baptism") {
        const subject = event.participants.find(
          (participant) => participant.role === "Subject",
        );

        return {
          ...commonEvent,
          description: `Baptism of ${displayName(subject)}`,
          Icon: IconBible,
        };
      }

      if (event.type === "Burial") {
        const deceased = event.participants.find(
          (participant) => participant.role === "Deceased",
        );

        return {
          ...commonEvent,
          description: `Burial of ${displayName(deceased)}`,
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
