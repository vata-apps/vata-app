import displayName from "@/utils/displayName";
import {
  IconBabyCarriage,
  IconHeartHandshake,
  IconSkull,
} from "@tabler/icons-react";
import { Events } from "../events/fetchEvents";

function isBefore(
  date: string | undefined | null,
  date2: string | undefined | null,
) {
  if (!date || !date2) return false;
  return new Date(date).getTime() < new Date(date2).getTime();
}

function isAfter(
  date: string | undefined | null,
  date2: string | undefined | null,
) {
  if (!date || !date2) return false;
  return new Date(date).getTime() > new Date(date2).getTime();
}

interface Params {
  gender: "male" | "female";
  individualId: string;
}

export function formatEventsForIndividual(events: Events, params: Params) {
  const { gender, individualId } = params;

  const birth = events.find(
    (event) =>
      event.type.key === "birth" &&
      event.participants.find((participant) => participant.role === "Subject")
        ?.id === individualId,
  );
  const death = events.find(
    (event) =>
      event.type.key === "death" &&
      event.participants.find((participant) => participant.role === "Subject")
        ?.id === individualId,
  );

  return events
    .map((event) => {
      const commonEvent = {
        id: event.id,
        date: event.date,
        place: event.place,
        type: event.type,
      };

      if (event.type.key === "birth") {
        if (isBefore(event.date, birth?.date ?? "")) {
          return null;
        }

        const subject = event.participants.find(
          (participant) => participant.role === "subject",
        );

        if (!subject) return null;
        const isSubject = subject.id === individualId;

        return {
          ...commonEvent,
          description: isSubject ? "Birth" : "Birth of " + displayName(subject),
          Icon: IconBabyCarriage,
        };
      }

      if (event.type.key === "death") {
        if (isAfter(event.date, death?.date ?? null)) {
          return null;
        }

        const subject = event.participants.find(
          (participant) => participant.role === "subject",
        );

        if (!subject) return null;
        const isSubject = subject.id === individualId;

        return {
          ...commonEvent,
          description: isSubject ? "Death" : "Death of " + displayName(subject),
          Icon: IconSkull,
        };
      }

      if (event.type.key === "marriage") {
        const husband = event.participants.find(
          (participant) => participant.role === "husband",
        );
        const wife = event.participants.find(
          (participant) => participant.role === "wife",
        );

        const partner = gender === "male" ? wife : husband;

        if (!partner) return null;

        return {
          ...commonEvent,
          description: `Marriage with ${displayName(partner)}`,
          Icon: IconHeartHandshake,
        };
      }

      return null;
    })
    .filter((event) => event !== null)
    .sort((a, b) => {
      return a.date?.localeCompare(b.date ?? "") ?? 0;
    });
}
