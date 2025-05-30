import { supabase } from "../../../lib/supabase";
import type { Individual } from "../types";

// Type definitions for Supabase responses
type EventResponse = {
  id: string;
  date: string | null;
  type_id: string;
  place_id: string | null;
  places: { id: string; name: string } | { id: string; name: string }[] | null;
  event_types:
    | { id: string; name: string }
    | { id: string; name: string }[]
    | null;
};

type EventSubjectResponse = {
  individual_id: string;
  events: EventResponse | EventResponse[] | null;
};

type EventParticipantResponse = {
  individual_id: string;
  events: EventResponse | EventResponse[] | null;
};

/**
 * Fetches event subjects for given individual IDs
 */
async function fetchEventSubjects(
  individualIds: string[],
): Promise<EventSubjectResponse[]> {
  const { data: eventSubjects, error: subjectsError } = await supabase
    .from("event_subjects")
    .select(
      `
      individual_id,
      events (
        id,
        date,
        type_id,
        place_id,
        places (
          id,
          name
        ),
        event_types (
          id,
          name
        )
      )
    `,
    )
    .in("individual_id", individualIds);

  if (subjectsError) throw subjectsError;
  return (eventSubjects || []) as EventSubjectResponse[];
}

/**
 * Fetches event participants for given individual IDs
 */
async function fetchEventParticipants(
  individualIds: string[],
): Promise<EventParticipantResponse[]> {
  const { data: eventParticipants, error: participantsError } = await supabase
    .from("event_participants")
    .select(
      `
      individual_id,
      events (
        id,
        date,
        type_id,
        place_id,
        places (
          id,
          name
        ),
        event_types (
          id,
          name
        )
      )
    `,
    )
    .in("individual_id", individualIds);

  if (participantsError) throw participantsError;
  return (eventParticipants || []) as EventParticipantResponse[];
}

/**
 * Normalizes event data from Supabase response
 */
function normalizeEventData(
  event: EventResponse,
): Individual["individual_events"][0] {
  return {
    id: event.id,
    date: event.date,
    type_id: event.type_id,
    place_id: event.place_id,
    places: Array.isArray(event.places) ? event.places[0] : event.places,
    individual_event_types: Array.isArray(event.event_types)
      ? event.event_types[0]
      : event.event_types,
  };
}

/**
 * Processes subject events and adds them to the events map
 */
function processSubjectEvents(
  eventSubjects: EventSubjectResponse[],
  eventsByIndividual: Record<string, Individual["individual_events"]>,
) {
  eventSubjects.forEach((subject) => {
    const individualId = subject.individual_id;
    if (!eventsByIndividual[individualId]) {
      eventsByIndividual[individualId] = [];
    }

    if (subject.events) {
      const events = Array.isArray(subject.events)
        ? subject.events
        : [subject.events];
      events.forEach((event: EventResponse) => {
        eventsByIndividual[individualId].push(normalizeEventData(event));
      });
    }
  });
}

/**
 * Processes participant events and adds them to the events map (avoiding duplicates)
 */
function processParticipantEvents(
  eventParticipants: EventParticipantResponse[],
  eventsByIndividual: Record<string, Individual["individual_events"]>,
) {
  eventParticipants.forEach((participant) => {
    const individualId = participant.individual_id;
    if (!eventsByIndividual[individualId]) {
      eventsByIndividual[individualId] = [];
    }

    if (participant.events) {
      const events = Array.isArray(participant.events)
        ? participant.events
        : [participant.events];
      events.forEach((event: EventResponse) => {
        // Check if event already exists for this individual
        const existingEvent = eventsByIndividual[individualId].find(
          (e: { id: string }) => e.id === event.id,
        );
        if (!existingEvent) {
          eventsByIndividual[individualId].push(normalizeEventData(event));
        }
      });
    }
  });
}

/**
 * Combines events from both subject and participant sources
 */
export async function fetchAndCombineEvents(individualIds: string[]) {
  // Fetch events from both sources in parallel
  const [eventSubjects, eventParticipants] = await Promise.all([
    fetchEventSubjects(individualIds),
    fetchEventParticipants(individualIds),
  ]);

  // Combine events from both sources
  const eventsByIndividual: Record<string, Individual["individual_events"]> =
    {};

  processSubjectEvents(eventSubjects, eventsByIndividual);
  processParticipantEvents(eventParticipants, eventsByIndividual);

  return eventsByIndividual;
}
