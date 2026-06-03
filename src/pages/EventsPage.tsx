import { useMemo } from 'react';
import { Link as RouterLink, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Box, Link } from '@radix-ui/themes';

import { EntityTable, type EntityTableColumn } from '$components/entity-table';
import { useEvents } from '$hooks/useEvents';
import { eventTypeLabel } from '$lib/eventTypeLabel';
import { sortByKey } from '$lib/sortByKey';
import { formatName } from '$db-tree/names';
import type { EventListEntry, EventPrincipal, Name } from '$types/database';

interface EventsPageProps {
  treeId: string;
}

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
 * The Events section page — the full-width table of every event in the
 * open tree. A row click opens that event's detail route.
 */
export function EventsPage({ treeId }: EventsPageProps): JSX.Element {
  const { t } = useTranslation('events');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { data, isLoading, isError } = useEvents();

  const rows = useMemo(() => (data ? sortByKey(data, (event) => event.dateSort) : []), [data]);

  const columns = useMemo<EntityTableColumn<EventListEntry>[]>(() => {
    const unknownPrincipal = t('table.unknownPrincipal');
    const dateUnknown = t('table.dateUnknown');
    return [
      {
        key: 'type',
        header: t('table.columns.type'),
        rowHeader: true,
        cell: (event) => (
          <Link asChild onClick={(domEvent) => domEvent.stopPropagation()}>
            <RouterLink to="/tree/$treeId/event/$eventId" params={{ treeId, eventId: event.id }}>
              {eventTypeLabel(event.eventType, t)}
            </RouterLink>
          </Link>
        ),
      },
      {
        key: 'date',
        header: t('table.columns.date'),
        width: '160px',
        cell: (event) =>
          event.dateOriginal ?? (event.dateSort ? event.dateSort.slice(0, 4) : dateUnknown),
      },
      {
        key: 'principals',
        header: t('table.columns.principals'),
        cell: (event) => principalsText(event.principals, unknownPrincipal),
      },
      {
        key: 'place',
        header: t('table.columns.place'),
        cell: (event) => event.place?.name ?? '—',
      },
    ];
  }, [t, treeId]);

  return (
    <Box p="4">
      <EntityTable
        label={tCommon('nav.events')}
        columns={columns}
        rows={rows}
        getRowKey={(event) => event.id}
        onRowClick={(event) =>
          navigate({ to: '/tree/$treeId/event/$eventId', params: { treeId, eventId: event.id } })
        }
        isLoading={isLoading}
        isError={isError}
        errorMessage={tCommon('errors.loadFailed')}
        emptyMessage={t('table.empty')}
      />
    </Box>
  );
}
