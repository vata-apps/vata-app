import displayName from "./displayName";
import { capitalize } from "./strings";

type Event = {
  eventType: "individual" | "family";
  individual_event_types?: { name: string };
  family_event_types?: { name: string };
  individuals?: {
    names: Array<{
      first_name: string | null;
      last_name: string | null;
      is_primary: boolean;
    }>;
  };
  families?: {
    husband?: {
      names: Array<{
        first_name: string | null;
        last_name: string | null;
        is_primary: boolean;
      }>;
    } | null;
    wife?: {
      names: Array<{
        first_name: string | null;
        last_name: string | null;
        is_primary: boolean;
      }>;
    } | null;
  };
};

/**
 * Gets a formatted title for an event
 * @param event The event object
 * @returns A formatted event title including the event type and individual/family names
 */
export function getEventTitle(event: Event) {
  if (event.eventType === "individual") {
    const eventType = capitalize(event.individual_event_types?.name || "Event");
    const personName = displayName(event.individuals?.names || []);
    return `${eventType} - ${personName}`;
  }

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
