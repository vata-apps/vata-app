import { Link as RouterLink } from '@tanstack/react-router';

import { EntityTableColumn, rowLink } from '$components/entity-table';
import { eventTypeLabel } from '$lib/eventTypeLabel';
import type { EventWithDetails } from '$types/database';

/** Translate function compatible with {@link eventTypeLabel} (events namespace). */
type TranslateFn = (key: string, options?: { ns?: string }) => string;

/**
 * Column widths shared by every event table, keyed by the kind of data each
 * column holds so columns of the same type stay visually uniform.
 */
export const EVENT_COLUMN_WIDTH = { type: '200px', date: '160px' } as const;

/**
 * The event-type column: a keyboard-focusable router link (styled as plain
 * text) to the event's detail route, used as the table's row header. The
 * whole row is clickable via the table's derived row click. Shared by every
 * event table (the tree-wide Events page and a person's Events tab).
 */
export function eventTypeColumn<T extends EventWithDetails>(
  treeId: string,
  t: TranslateFn
): EntityTableColumn<T> {
  return {
    key: 'type',
    header: t('table.columns.type'),
    rowHeader: true,
    width: EVENT_COLUMN_WIDTH.type,
    cell: (event) => (
      <RouterLink
        to="/tree/$treeId/event/$eventId"
        params={{ treeId, eventId: event.id }}
        className={rowLink}
      >
        {eventTypeLabel(event.eventType, t)}
      </RouterLink>
    ),
    sortValue: (event) => eventTypeLabel(event.eventType, t) || null,
  };
}

/**
 * The event-date column: the verbatim original date, falling back to the
 * sortable year, then an unknown label. Pass `sortable` to make the header sort
 * by the sortable date; omit it to preserve a caller-supplied order.
 */
export function eventDateColumn<T extends EventWithDetails>(
  t: TranslateFn,
  options: { sortable?: boolean } = {}
): EntityTableColumn<T> {
  const dateUnknown = t('table.dateUnknown');
  return {
    key: 'date',
    header: t('table.columns.date'),
    width: EVENT_COLUMN_WIDTH.date,
    cell: (event) =>
      event.dateOriginal ?? (event.dateSort ? event.dateSort.slice(0, 4) : dateUnknown),
    ...(options.sortable ? { sortValue: (event: T) => event.dateSort ?? null } : {}),
  };
}

/** The event-place column: the place name, or an em dash when none is recorded. */
export function eventPlaceColumn<T extends EventWithDetails>(t: TranslateFn): EntityTableColumn<T> {
  return {
    key: 'place',
    header: t('table.columns.place'),
    cell: (event) => event.place?.name ?? '—',
    sortValue: (event) => event.place?.name ?? null,
  };
}
