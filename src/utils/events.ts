import { Event, isFamilyEvent, isIndividualEvent } from "@/types";
import displayName from "./displayName";
import { capitalize } from "./strings";

/**
 * Gets a formatted title for an event
 * @param event The event object
 * @returns A formatted event title including the event type and individual/family names
 */
export function getEventTitle(event: Event) {
  if (isIndividualEvent(event)) {
    const eventType = capitalize(event.individual_event_types?.name || "Event");
    const personName = displayName(event.individuals?.names || []);
    return `${eventType} - ${personName}`;
  }

  if (isFamilyEvent(event)) {
    const eventType = capitalize(event.family_event_types?.name || "Event");
    const husband = event.families?.husband;
    const wife = event.families?.wife;

    if (husband && wife) {
      return `${eventType} - ${displayName(husband.names)} & ${displayName(wife.names)}`;
    } else if (husband) {
      return `${eventType} - ${displayName(husband.names)}`;
    } else if (wife) {
      return `${eventType} - ${displayName(wife.names)}`;
    }

    return `${eventType} - Unknown Family`;
  }

  return "Unknown Event";
}
