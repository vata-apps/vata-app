import { Individuals } from "@/api/individuals/fetchIndividuals";
import displayName from "@/utils/displayName";
import { capitalize } from "@/utils/strings";

interface Params {
  event: {
    id: string;
    date: string | null;
    place: { id: string; name: string } | null;
    event_types: { key: string | null; id: string; name: string };
  };
  participants: (Individuals[number] & { role: string })[];
}

export function getEventTitle({ event, participants }: Params) {
  if (event.event_types.key === "marriage") {
    const husband = participants.find(
      (participant) => participant.role === "husband",
    );

    const wife = participants.find(
      (participant) => participant.role === "wife",
    );

    return `Marriage of ${displayName(husband)} & ${displayName(wife)}`;
  }

  const subject = participants.find(
    (participant) => participant.role === "subject",
  );

  return `${capitalize(event.event_types.name ?? "Unknown event")} of ${displayName(subject)}`;
}
