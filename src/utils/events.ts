import { Event } from "@/api/events/fetchEvent";
import displayName from "./displayName";
import { capitalize } from "./strings";

/**
 * Gets a formatted title for an event
 * @param event The event object
 * @returns A formatted event title including the event type and subject names
 */
export function getEventTitle(event: Event): string {
  const eventType = capitalize(event.type.name);

  if (event.participants.length === 0) {
    return `${eventType} of Unknown`;
  }

  const subjectNames = event.participants
    .filter((participant) =>
      ["Subject", "Husband", "Wife", "Deceased"].includes(participant.role),
    )
    .map((participant) => displayName(participant))
    .join(" & ");

  return `${eventType} of ${subjectNames}`;
}
