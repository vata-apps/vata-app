import displayName from "@/utils/displayName";
import IconBabyCarriage from "@tabler/icons-react/dist/esm/icons/IconBabyCarriage";
import IconHeartHandshake from "@tabler/icons-react/dist/esm/icons/IconHeartHandshake";
import IconSkull from "@tabler/icons-react/dist/esm/icons/IconSkull";
import { Events } from "../events/fetchEvents";

interface Params {
  gender: "male" | "female";
  individualId: string;
}

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

export function formatEventsForIndividual(events: Events, params: Params) {
  const { gender, individualId } = params;

  const birth = events.find(
    (event) =>
      event.type === "Birth" &&
      event.participants.find((participant) => participant.role === "Subject")
        ?.id === individualId,
  );
  const death = events.find(
    (event) =>
      event.type === "Death" &&
      event.participants.find((participant) => participant.role === "Deceased")
        ?.id === individualId,
  );

  console.log(birth, death);

  return events
    .map((event) => {
      const commonEvent = {
        id: event.id,
        date: event.date,
        place: event.place,
        type: event.type,
      };

      if (event.type === "Birth") {
        if (isBefore(event.date, birth?.date ?? "")) {
          return null;
        }

        const subject = event.participants.find(
          (participant) => participant.role === "Subject",
        );

        if (!subject) return null;
        const isSubject = subject.id === individualId;

        return {
          ...commonEvent,
          description: isSubject ? "Birth" : "Birth of " + displayName(subject),
          Icon: IconBabyCarriage,
        };
      }

      if (event.type === "Death") {
        if (isAfter(event.date, death?.date ?? null)) {
          return null;
        }

        const subject = event.participants.find(
          (participant) => participant.role === "Deceased",
        );

        if (!subject) return null;
        const isSubject = subject.id === individualId;

        return {
          ...commonEvent,
          description: isSubject ? "Death" : "Death of " + displayName(subject),
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
