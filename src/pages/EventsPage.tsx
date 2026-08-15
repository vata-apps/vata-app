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
import { useEventFilterOptions, useEventsPage } from '$hooks/useEvents';
import { eventDateColumn, eventPlaceColumn, eventTypeColumn } from '$lib/event-columns';
import { eventTypeLabel } from '$lib/eventTypeLabel';
import { principalsText } from '$lib/principals-text';
import type { EventListEntry } from '$types/database';

import * as styles from './list-page.css';

interface EventsPageProps {
  treeId: string;
}

/**
 * The Events section page — the full-width table of every event in the
 * open tree. A row click opens that event's detail route.
 */
export function EventsPage({ treeId }: EventsPageProps): JSX.Element {
  const { t } = useTranslation('events');
  const { t: tCommon } = useTranslation('common');

  const [filters, setFilters] = useState(DEFAULT_EVENT_FILTERS);

  // Filtering and paging happen in SQL (see issue #266): the list arrives
  // chronological, ordered on the SQL side, so the page has no interactive
  // column sort — see the columns below.
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useEventsPage({
      filters: { eventTypeId: filters.type, placeId: filters.place },
    });
  const rows = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  // The Type and Place filters list only the values actually present in the
  // tree, resolved by a lightweight dedicated query rather than derived from
  // the (now partial) loaded page.
  const { data: filterOptions } = useEventFilterOptions();
  const typeOptions = useMemo<EventFilterOption[]>(
    () =>
      (filterOptions?.types ?? [])
        .map((type) => ({ value: type.id, label: eventTypeLabel(type, t) }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [filterOptions, t]
  );
  const placeOptions = useMemo<EventFilterOption[]>(
    () =>
      (filterOptions?.places ?? [])
        .map((place) => ({ value: place.id, label: place.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [filterOptions]
  );

  const columns = useMemo<EntityTableColumn<EventListEntry>[]>(() => {
    const unknownPrincipal = t('table.unknownPrincipal');
    return [
      // Sortable in principle, but a keyset/offset-paginated page can only
      // ever sort the rows it has loaded — re-sorting them client-side would
      // misrepresent the full, not-fully-loaded list, so every column here
      // stays unsortable and the chronological SQL order is authoritative.
      eventTypeColumn(treeId, t, { sortable: false }),
      eventDateColumn(t),
      {
        key: 'principals',
        header: t('table.columns.principals'),
        cell: (event) => principalsText(event.principals, unknownPrincipal),
      },
      eventPlaceColumn(t, { sortable: false }),
    ];
  }, [t, treeId]);

  const filtered = hasActiveFilters(filters);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.title}>
          <Icon name="calendar" size={28} />
          <Typography as="h1" size="lg" weight="strong">
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
          rows={rows}
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

      {hasNextPage && (
        <div className={styles.loadMoreRow}>
          <Button variant="ghost" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? tCommon('table.loadingMore') : tCommon('table.loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
}
