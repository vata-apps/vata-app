import { Event, FamilyEvent, IndividualEvent } from "./event";

/**
 * Type guard to check if an event is an individual event
 */
export function isIndividualEvent(event: Event): event is IndividualEvent {
  return event.eventType === "individual";
}

/**
 * Type guard to check if an event is a family event
 */
export function isFamilyEvent(event: Event): event is FamilyEvent {
  return event.eventType === "family";
}
