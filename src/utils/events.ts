import type { Event } from "@/types/event";
import { getEventSubjects } from "@/types/guards";
import displayName from "./displayName";
import { capitalize } from "./strings";

/**
 * Gets a formatted title for an event
 * @param event The event object
 * @returns A formatted event title including the event type and subject names
 */
export function getEventTitle(event: Event): string {
  const eventType = capitalize(event.event_type.name);
  const subjects = getEventSubjects(event);

  if (subjects.length === 0) {
    return `${eventType} of Unknown`;
  }

  const subjectNames = subjects
    .map((subject) => {
      const primaryName =
        subject.individual.names.find((name) => name.is_primary) ||
        subject.individual.names[0];
      return displayName([primaryName]);
    })
    .join(" & ");

  return `${eventType} of ${subjectNames}`;
}
