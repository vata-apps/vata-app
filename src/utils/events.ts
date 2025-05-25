import type { Event, EventListItem } from "@/types/event";
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
    return `${eventType} - Unknown`;
  }

  const subjectNames = subjects
    .map((subject) => {
      const primaryName =
        subject.individual.names.find((name) => name.is_primary) ||
        subject.individual.names[0];
      return displayName([primaryName]);
    })
    .join(" & ");

  return `${eventType} - ${subjectNames}`;
}

/**
 * Gets a formatted title for an event list item
 * @param event The event list item
 * @returns A formatted event title
 */
export function getEventListTitle(event: EventListItem): string {
  const eventType = capitalize(event.event_type_name);
  return `${eventType} - ${event.subjects}`;
}
