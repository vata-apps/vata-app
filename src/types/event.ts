import type { Tables } from "@/database.types";

/**
 * Base event from the database
 */
export type EventRow = Tables<"events">;

/**
 * Event type from the database
 */
export type EventTypeRow = Tables<"event_types">;

/**
 * Event role from the database
 */
export type EventRoleRow = Tables<"event_roles">;

/**
 * Event subject from the database
 */
export type EventSubjectRow = Tables<"event_subjects">;

/**
 * Event participant from the database
 */
export type EventParticipantRow = Tables<"event_participants">;

/**
 * Individual with names for event participants
 */
export type EventIndividual = {
  readonly id: string;
  readonly gender: "male" | "female";
  readonly names: Array<{
    readonly first_name: string | null;
    readonly last_name: string | null;
    readonly is_primary: boolean;
  }>;
};

/**
 * Event participant with role and individual information
 */
export type EventParticipant = {
  readonly id: string;
  readonly individual_id: string;
  readonly role_name: string;
  readonly is_subject: boolean;
  readonly individual: EventIndividual;
};

/**
 * Complete event with all related information
 */
export type Event = {
  readonly id: string;
  readonly date: string | null;
  readonly description: string | null;
  readonly place_id: string | null;
  readonly event_type: {
    readonly id: string;
    readonly name: string;
    readonly category: string;
  };
  readonly place?: {
    readonly id: string;
    readonly name: string;
  } | null;
  readonly participants: readonly EventParticipant[];
};

/**
 * Event for list display (simplified)
 */
export type EventListItem = {
  readonly id: string;
  readonly date: string | null;
  readonly description: string | null;
  readonly event_type_name: string;
  readonly place_name: string | null;
  readonly subjects: string; // Comma-separated names
};
