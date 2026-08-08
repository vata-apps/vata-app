import type { CreateEventInput, Event, EventType, UpdateEventInput } from '$types/database';

/**
 * The editable shape of an event record, restricted to the fields this tab
 * exposes (type, date, note — place and participants are handled outside the
 * form, since a place has no picker yet and participants are their own
 * add/remove flow rather than a buffered field).
 */
export interface EventForm {
  eventTypeId: string;
  dateOriginal: string;
  notes: string;
}

export function toEventForm(event: Event): EventForm {
  return {
    eventTypeId: event.eventTypeId,
    dateOriginal: event.dateOriginal ?? '',
    notes: event.notes ?? '',
  };
}

/** A blank draft — `eventTypeId` starts unset so "create" stays disabled until a type is chosen. */
export function emptyEventForm(): EventForm {
  return { eventTypeId: '', dateOriginal: '', notes: '' };
}

/** The draft footer's create action waits on a type being chosen — the one required field. */
export function isEventFormComplete(form: EventForm): boolean {
  return form.eventTypeId !== '';
}

/** Blank date/notes map to `null` so a cleared field reaches the column as `NULL` rather than being left untouched. */
export function toEventPayload(form: EventForm): UpdateEventInput {
  return {
    eventTypeId: form.eventTypeId,
    dateOriginal: form.dateOriginal.trim() || null,
    notes: form.notes.trim() || null,
  };
}

/** Whether two states of the same record would persist identically. */
export function isSameEventPayload(a: EventForm, b: EventForm): boolean {
  return (
    a.eventTypeId === b.eventTypeId &&
    a.dateOriginal.trim() === b.dateOriginal.trim() &&
    a.notes.trim() === b.notes.trim()
  );
}

/** A draft's payload for creation — unlike an update, a blank field is simply omitted rather than sent as `null`. */
export function toCreateEventInput(form: EventForm): CreateEventInput {
  return {
    eventTypeId: form.eventTypeId,
    dateOriginal: form.dateOriginal.trim() || undefined,
    notes: form.notes.trim() || undefined,
  };
}

/** GEDCOM tags for events tree-wide lists display directly (birth/death years on the people rail, the table, …). */
const TREE_WIDE_DISPLAY_TAGS = new Set(['BIRT', 'DEAT']);

/** Whether editing this event type could change what a tree-wide list (the people rail, the table) displays for this person. */
export function affectsTreeWideDisplay(eventTypeId: string, eventTypes: EventType[]): boolean {
  const type = eventTypes.find((candidate) => candidate.id === eventTypeId);
  return type !== undefined && type.tag !== null && TREE_WIDE_DISPLAY_TAGS.has(type.tag);
}
