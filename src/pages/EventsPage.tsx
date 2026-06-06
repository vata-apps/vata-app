import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Box, Button, Flex, Grid, Heading, Link } from '@radix-ui/themes';

import { EntityTable, type EntityTableColumn } from '$components/entity-table';
import {
  DEFAULT_EVENT_FILTERS,
  EventsFilters,
  type EventFilterOption,
  hasActiveFilters,
} from '$components/events-filters';
import { Icon } from '$components/icon';
import { useEvents } from '$hooks/useEvents';
import { eventTypeLabel } from '$lib/eventTypeLabel';
import { formatName } from '$db-tree/names';
import type { EventListEntry, EventPrincipal, Name } from '$types/database';

interface EventsPageProps {
  treeId: string;
}

/**
 * Column widths keyed by the kind of data each column holds, so columns of
 * the same type stay visually uniform regardless of their contents.
 */
const COLUMN_WIDTH = {
  type: '200px',
  date: '160px',
} as const;

/** A single principal name, falling back to the unknown label. */
function nameText(name: Name | null, unknownLabel: string): string {
  if (!name) return unknownLabel;
  return formatName(name).full || unknownLabel;
}

/** Comma-joined principal names for an event row, spouses paired with `&`. */
function principalsText(principals: EventPrincipal[], unknownLabel: string): string {
  if (principals.length === 0) return unknownLabel;
  return principals
    .map((principal) =>
      principal.kind === 'individual'
        ? nameText(principal.name, unknownLabel)
        : `${nameText(principal.husband, unknownLabel)} & ${nameText(principal.wife, unknownLabel)}`
    )
    .join(', ');
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
  const navigate = useNavigate();
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
    const dateUnknown = t('table.dateUnknown');
    return [
      {
        key: 'type',
        header: t('table.columns.type'),
        rowHeader: true,
        width: COLUMN_WIDTH.type,
        // A keyboard-focusable link (styled as plain text — no color/underline)
        // so the list is navigable without a pointer; the whole row is also
        // clickable via `onRowClick`, so the link stops propagation.
        cell: (event) => (
          <Link
            asChild
            color="gray"
            highContrast
            underline="none"
            onClick={(domEvent) => domEvent.stopPropagation()}
          >
            <RouterLink to="/tree/$treeId/event/$eventId" params={{ treeId, eventId: event.id }}>
              {eventTypeLabel(event.eventType, t)}
            </RouterLink>
          </Link>
        ),
        sortValue: (event) => eventTypeLabel(event.eventType, t) || null,
      },
      {
        key: 'date',
        header: t('table.columns.date'),
        width: COLUMN_WIDTH.date,
        cell: (event) =>
          event.dateOriginal ?? (event.dateSort ? event.dateSort.slice(0, 4) : dateUnknown),
      },
      {
        key: 'principals',
        header: t('table.columns.principals'),
        cell: (event) => principalsText(event.principals, unknownPrincipal),
        sortValue: (event) =>
          event.principals.length === 0 ? null : principalsText(event.principals, unknownPrincipal),
      },
      {
        key: 'place',
        header: t('table.columns.place'),
        cell: (event) => event.place?.name ?? '—',
        sortValue: (event) => event.place?.name ?? null,
      },
    ];
  }, [t, treeId]);

  return (
    <Box p="4">
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between" pt="2" pb="3">
          <Flex align="center" gap="3">
            <Icon name="calendar" size={28} />
            <Heading size="7" trim="both">
              {tCommon('nav.events')}
            </Heading>
          </Flex>
          <Button disabled>
            <Icon name="plus" />
            {t('page.addEvent')}
          </Button>
        </Flex>

        <Grid columns="280px 1fr" gap="4" align="start">
          <EventsFilters
            value={filters}
            onChange={setFilters}
            types={typeOptions}
            places={placeOptions}
          />
          <EntityTable
            label={tCommon('nav.events')}
            columns={columns}
            rows={visibleRows}
            getRowKey={(event) => event.id}
            onRowClick={(event) =>
              navigate({
                to: '/tree/$treeId/event/$eventId',
                params: { treeId, eventId: event.id },
              })
            }
            isLoading={isLoading}
            isError={isError}
            errorMessage={tCommon('errors.loadFailed')}
            emptyMessage={hasActiveFilters(filters) ? t('table.noMatches') : t('table.empty')}
          />
        </Grid>
      </Flex>
    </Box>
  );
}
