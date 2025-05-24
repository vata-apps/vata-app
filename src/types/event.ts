import { Enums } from "@/database.types";

/**
 * Base properties for all event types
 */
export type EventBase = {
  id: string;
  date: string | null;
  description: string | null;
  place_id: string | null;
  places?: {
    id: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  eventType: "individual" | "family";
};

/**
 * Event related to an individual
 */
export type IndividualEvent = EventBase & {
  eventType: "individual";
  individual_id: string;
  individuals: {
    id: string;
    gender: Enums<"gender">;
    names: Array<{
      first_name: string | null;
      last_name: string | null;
      is_primary: boolean;
    }>;
  };
  individual_event_types: { id: string; name: string };
};

/**
 * Event related to a family
 */
export type FamilyEvent = EventBase & {
  eventType: "family";
  family_id: string;
  families: {
    id: string;
    husband_id: string | null;
    wife_id: string | null;
    husband?: {
      id: string;
      gender: Enums<"gender">;
      names: Array<{
        first_name: string | null;
        last_name: string | null;
        is_primary: boolean;
      }>;
    } | null;
    wife?: {
      id: string;
      gender: Enums<"gender">;
      names: Array<{
        first_name: string | null;
        last_name: string | null;
        is_primary: boolean;
      }>;
    } | null;
  };
  family_event_types: { id: string; name: string };
};

/**
 * Union type for all event types
 */
export type Event = IndividualEvent | FamilyEvent;
