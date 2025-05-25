import type { Event } from "./event";

/**
 * Type guard to check if an event is a birth or death event (typically individual-focused)
 */
export function isIndividualEvent(event: Event): boolean {
  const individualEventTypes = [
    "birth",
    "death",
    "baptism",
    "burial",
    "graduation",
    "retirement",
    "immigration",
    "emigration",
    "naturalization",
    "census",
    "will",
    "probate",
  ];
  return individualEventTypes.includes(event.event_type.name);
}

/**
 * Type guard to check if an event is a marriage or family-related event
 */
export function isFamilyEvent(event: Event): boolean {
  const familyEventTypes = [
    "marriage",
    "divorce",
    "engagement",
    "annulment",
    "separation",
  ];
  return familyEventTypes.includes(event.event_type.name);
}

/**
 * Gets the subjects of an event (people the event is primarily about)
 */
export function getEventSubjects(event: Event) {
  return event.participants.filter((participant) => participant.is_subject);
}

/**
 * Gets the non-subject participants of an event (witnesses, officiants, etc.)
 */
export function getEventParticipants(event: Event) {
  return event.participants.filter((participant) => !participant.is_subject);
}
