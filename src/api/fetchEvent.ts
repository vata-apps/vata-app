import type { Event } from "@/types/event";
import { supabase } from "../lib/supabase";

/**
 * Fetches a single event by ID from the unified event system
 * @param eventId - The ID of the event to fetch
 * @throws When there's an error fetching data from Supabase
 */
export async function fetchEvent(eventId: string): Promise<Event> {
  // Use the RPC function to get event with all participants
  const { data, error } = await supabase.rpc("get_event_participants", {
    event_id: eventId,
  });

  if (error) throw error;
  if (!data) throw new Error("Event not found");

  // Transform the RPC result to match our Event type
  const event: Event = {
    id: data.id,
    date: data.date,
    description: data.description,
    place_id: data.place_id,
    event_type: {
      id: data.event_type.id,
      name: data.event_type.name,
    },
    place: data.place
      ? {
          id: data.place.id,
          name: data.place.name,
        }
      : null,
    participants: (data.participants || []).map(
      (participant: {
        id: string;
        individual_id: string;
        role_name: string;
        is_subject: boolean;
        individual: {
          id: string;
          gender: "male" | "female";
          names: Array<{
            first_name: string | null;
            last_name: string | null;
            is_primary: boolean;
          }>;
        };
      }) => ({
        id: participant.id,
        individual_id: participant.individual_id,
        role_name: participant.role_name,
        is_subject: participant.is_subject,
        individual: {
          id: participant.individual.id,
          gender: participant.individual.gender,
          names: participant.individual.names,
        },
      }),
    ),
  };

  return event;
}
