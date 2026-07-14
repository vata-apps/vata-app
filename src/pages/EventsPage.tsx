import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EntityTable, type EntityTableColumn } from '$components/entity-table';
import {
  DEFAULT_EVENT_FILTERS,
  EventsFilterToolbar,
  type EventFilterOption,
  hasActiveFilters,
} from '$components/events-filters';
import { Icon } from '$components/icon';
import { Button } from '$components/ui/button';
import { Typography } from '$components/ui/typography';
import { useEvents } from '$hooks/useEvents';
import { eventDateColumn, eventPlaceColumn, eventTypeColumn } from '$lib/event-columns';
import { eventTypeLabel } from '$lib/eventTypeLabel';
import { principalsText } from '$lib/principals-text';
import type { EventListEntry } from '$types/database';

import * as styles from './list-page.css';

interface EventsPageProps {
  treeId: string;
}

/**
 * Build the select options for a filter: project each event to a
 * `[value, label]` pair (or `null` to skip it), dedupe on the value, and
 * sort by label. Both the Type and Place filters list only the values that
 * actually occur in the loaded events.
 */
function toSortedOptions(
  events: EventListEntry[],
  project: (event: EventListEntry) => [string, string] | null
): EventFilterOption[] {
  const byId = new Map<string, string>();
  for (const event of events) {
    const pair = project(event);
    if (pair) byId.set(pair[0], pair[1]);
  }
  return Array.from(byId, ([value, label]) => ({ value, label })).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
}

/**
 * The Events section page — the full-width table of every event in the
 * open tree. A row click opens that event's detail route.
 */
export function EventsPage({ treeId }: EventsPageProps): JSX.Element {
  const { t } = useTranslation('events');
  const { t: tCommon } = useTranslation('common');
  const { data, isLoading, isError } = useEvents();

  const [filters, setFilters] = useState(DEFAULT_EVENT_FILTERS);

  // The Type filter offers every event type present in the loaded events,
  // by label; deduped on the type id.
  const typeOptions = useMemo<EventFilterOption[]>(
    () =>
      toSortedOptions(data ?? [], (event) => [
        event.eventType.id,
        eventTypeLabel(event.eventType, t),
      ]),
    [data, t]
  );

  // The Place filter offers every place present on the loaded events.
  const placeOptions = useMemo<EventFilterOption[]>(
    () =>
      toSortedOptions(data ?? [], (event) =>
        event.place ? [event.place.id, event.place.name] : null
      ),
    [data]
  );

  // Filter the already-loaded list client-side by type and place (AND-ed).
  // The list arrives chronological from the manager; the Date column is not
  // sortable, so that natural order is preserved.
  const visibleRows = useMemo(() => {
    return (data ?? []).filter((event) => {
      if (filters.type !== 'all' && event.eventType.id !== filters.type) return false;
      if (filters.place !== 'all' && event.place?.id !== filters.place) return false;
      return true;
    });
  }, [data, filters.type, filters.place]);

  const columns = useMemo<EntityTableColumn<EventListEntry>[]>(() => {
    const unknownPrincipal = t('table.unknownPrincipal');
    return [
      eventTypeColumn(treeId, t),
      // The list arrives chronological from the manager, so the Date column
      // stays unsortable to preserve that natural order.
      eventDateColumn(t),
      {
        key: 'principals',
        header: t('table.columns.principals'),
        cell: (event) => principalsText(event.principals, unknownPrincipal),
        sortValue: (event) =>
          event.principals.length === 0 ? null : principalsText(event.principals, unknownPrincipal),
      },
      eventPlaceColumn(t),
    ];
  }, [t, treeId]);

  const filtered = hasActiveFilters(filters);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.title}>
          <Icon name="calendar" size={28} />
          <Typography as="h1" size="16" weight="650">
            {tCommon('nav.events')}
          </Typography>
        </div>
        <Button disabled>
          <Icon name="plus" />
          {t('page.addEvent')}
        </Button>
      </header>

      <div className={styles.toolbar}>
        <EventsFilterToolbar
          value={filters}
          onChange={setFilters}
          types={typeOptions}
          places={placeOptions}
        />
      </div>

      <div className={styles.tableWrapper}>
        <EntityTable
          label={tCommon('nav.events')}
          columns={columns}
          rows={visibleRows}
          getRowKey={(event) => event.id}
          isLoading={isLoading}
          isError={isError}
          errorMessage={tCommon('errors.loadFailed')}
          emptyMessage={t('table.empty')}
          noMatchesMessage={t('table.noMatches')}
          noMatchesAction={{
            label: tCommon('filters.clear'),
            onClick: () => setFilters(DEFAULT_EVENT_FILTERS),
          }}
          isFiltered={filtered}
        />
      </div>
    </div>
  );
}
