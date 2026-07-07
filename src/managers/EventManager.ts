import { getAllEventsWithDetails, getEventTypes } from '$db-tree/events';
import { resolvePrincipalsForEvents } from '$db-tree/event-principals';
import type { EventCategory, EventListEntry, EventType } from '$types/database';

export class EventManager {
  /**
   * Get every event in the tree as EventListEntry[], ordered date ascending
   * (NULL dateSort last), with a deterministic id tiebreaker.
   */
  static async getAll(): Promise<EventListEntry[]> {
    const events = await getAllEventsWithDetails();
    if (events.length === 0) return [];

    const principalsByEventId = await resolvePrincipalsForEvents(events);
    return events.map((event) => ({
      ...event,
      principals: principalsByEventId.get(event.id) ?? [],
    }));
  }

  /** Get all event types, optionally filtered by category. */
  static async getEventTypes(category?: EventCategory): Promise<EventType[]> {
    return getEventTypes(category);
  }
}
