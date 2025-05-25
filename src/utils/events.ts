import type { EventWithRelations } from "@/api";
import { Event } from "@/types";
import displayName from "./displayName";
import { capitalize } from "./strings";

/**
 * Gets a formatted title for an event
 * @param event The event object (either Event or EventWithRelations)
 * @returns A formatted event title including the event type and individual/family names
 */
export function getEventTitle(event: Event | EventWithRelations) {
  if (event.eventType === "individual") {
    const eventType = capitalize(event.individual_event_types?.name || "Event");
    const personName = displayName(event.individuals?.names || []);
    return `${eventType} - ${personName}`;
  }

  if (event.eventType === "family") {
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
