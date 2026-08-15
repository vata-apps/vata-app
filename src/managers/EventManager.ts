import {
  getAllEventsWithDetails,
  getEventPlaceOptions,
  getEventTypes,
  getEventTypesInUse,
  getEventsPage,
  type EventsPageParams,
} from '$db-tree/events';
import { resolvePrincipalsForEvents } from '$db-tree/event-principals';
import type { EventCategory, EventListEntry, EventType } from '$types/database';

/** The Events list's Type/Place filter options — only values actually present in the tree. */
export interface EventFilterOptions {
  types: EventType[];
  places: { id: string; name: string }[];
}

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

  /**
   * Get one windowed, filtered page of events as EventListEntry[] — the
   * paginated counterpart to `getAll` (see issue #266). The page is already
   * enriched and ordered by `getEventsPage`; this only resolves principals
   * for the page's events, mirroring `getAll`.
   */
  static async getPage(
    params: EventsPageParams
  ): Promise<{ items: EventListEntry[]; hasMore: boolean }> {
    const { events, hasMore } = await getEventsPage(params);
    if (events.length === 0) return { items: [], hasMore };

    const principalsByEventId = await resolvePrincipalsForEvents(events);
    const items = events.map((event) => ({
      ...event,
      principals: principalsByEventId.get(event.id) ?? [],
    }));
    return { items, hasMore };
  }

  /** The Events list's Type and Place filter options — values present in the tree only. */
  static async getFilterOptions(): Promise<EventFilterOptions> {
    const [types, places] = await Promise.all([getEventTypesInUse(), getEventPlaceOptions()]);
    return { types, places };
  }

  /** Get all event types, optionally filtered by category. */
  static async getEventTypes(category?: EventCategory): Promise<EventType[]> {
    return getEventTypes(category);
  }
}
