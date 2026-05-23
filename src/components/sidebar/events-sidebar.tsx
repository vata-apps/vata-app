import React, { useMemo, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button, Flex, Skeleton } from '@radix-ui/themes';

import { EntityListPanel } from './entity-list-panel';
import { EntityListBody } from './entity-list-body';
import { SidebarRow } from './sidebar-row';
import { buildSortOptions } from './sort-helpers';
import { Icon } from '$components/icon';
import { useEvents } from '$hooks/useEvents';
import { eventTypeLabel } from '$lib/eventTypeLabel';
import { formatName } from '$db-tree/names';
import type { EventListEntry, EventPrincipal, Name } from '$types/database';

const SORT_VALUES = ['date-asc', 'date-desc'] as const;
type SortValue = (typeof SORT_VALUES)[number];

const SORT_LABEL_KEYS: Record<SortValue, string> = {
  'date-asc': 'sidebar.sort.dateAsc',
  'date-desc': 'sidebar.sort.dateDesc',
};

function PrincipalName({
  name,
  unknownLabel,
}: {
  name: Name | null;
  unknownLabel: string;
}): JSX.Element {
  if (!name) {
    return (
      <SidebarRow.Name unknown aria-label={unknownLabel}>
        {unknownLabel}
      </SidebarRow.Name>
    );
  }
  const display = formatName(name).full;
  return <SidebarRow.Name>{display || unknownLabel}</SidebarRow.Name>;
}

function PrincipalsBlock({
  principals,
  unknownLabel,
}: {
  principals: EventPrincipal[];
  unknownLabel: string;
}): JSX.Element {
  if (principals.length === 0) {
    return <SidebarRow.Name unknown>{unknownLabel}</SidebarRow.Name>;
  }
  return (
    <>
      {principals.map((principal, index) => {
        if (principal.kind === 'individual') {
          return <PrincipalName key={index} name={principal.name} unknownLabel={unknownLabel} />;
        }
        return (
          <React.Fragment key={index}>
            <PrincipalName name={principal.husband} unknownLabel={unknownLabel} />
            <PrincipalName name={principal.wife} unknownLabel={unknownLabel} />
          </React.Fragment>
        );
      })}
    </>
  );
}

function MetaLine({
  event,
  dateUnknownLabel,
}: {
  event: EventListEntry;
  dateUnknownLabel: string;
}): JSX.Element {
  const datePart = event.dateOriginal ?? (event.dateSort ? event.dateSort.slice(0, 4) : null);
  const placePart = event.place?.name ?? null;

  const parts: string[] = [];
  if (datePart) {
    parts.push(datePart);
  } else {
    parts.push(dateUnknownLabel);
  }
  if (placePart) parts.push(`📍 ${placePart}`);

  return <SidebarRow.Meta>{parts.join(' · ')}</SidebarRow.Meta>;
}

function sortEvents(events: EventListEntry[], sort: SortValue): EventListEntry[] {
  return [...events].sort((a, b) => {
    const aDate = a.dateSort;
    const bDate = b.dateSort;
    if (aDate === null && bDate === null) return 0;
    if (aDate === null) return 1;
    if (bDate === null) return -1;
    const order = aDate.localeCompare(bDate);
    return sort === 'date-desc' ? -order : order;
  });
}

interface EventRowProps {
  event: EventListEntry;
  treeId: string;
  selected: boolean;
  unknownLabel: string;
  dateUnknownLabel: string;
}

function EventRow({
  event,
  treeId,
  selected,
  unknownLabel,
  dateUnknownLabel,
}: EventRowProps): JSX.Element {
  const { t } = useTranslation('events');
  const label = eventTypeLabel(event.eventType, t);

  return (
    <SidebarRow
      to="/tree/$treeId/event/$eventId"
      params={{ treeId, eventId: event.id }}
      selected={selected}
    >
      <SidebarRow.Eyebrow>{label}</SidebarRow.Eyebrow>
      <PrincipalsBlock principals={event.principals} unknownLabel={unknownLabel} />
      <MetaLine event={event} dateUnknownLabel={dateUnknownLabel} />
    </SidebarRow>
  );
}

const EVENTS_SKELETON_ROW = (
  <Flex direction="column" gap="1" px="2" py="2">
    <Skeleton width="40%" height="10px" />
    <Skeleton width="70%" height="12px" />
    <Skeleton width="55%" height="10px" />
  </Flex>
);

/**
 * The Events section sidebar — the list of every event in the open tree,
 * rendered in the in-tree shell's left column. Header (title, count, a
 * disabled "New" button), the scrollable event list, and a sort footer.
 *
 * Each row shows the event type as an uppercase eyebrow, the principal
 * name(s) below (italic Unknown when missing), and a meta line with the
 * date and place. Marriage rows stack both spouse names.
 *
 * Composed on top of {@link EntityListPanel} + {@link EntityListBody} +
 * {@link SidebarRow}, the shared shell and primitives for every section list.
 */
export function EventsSidebar(): JSX.Element | null {
  const { t } = useTranslation('events');
  const { t: tCommon } = useTranslation('common');
  const params = useParams({ strict: false });
  const { data, isLoading, isError } = useEvents();
  const [sort, setSort] = useState<SortValue>('date-asc');

  const rows = useMemo(() => (data ? sortEvents(data, sort) : []), [data, sort]);

  const sortOptions = useMemo(() => buildSortOptions(SORT_VALUES, SORT_LABEL_KEYS, t), [t]);

  const treeId = params.treeId;
  if (treeId === undefined) return null;

  const unknownLabel = t('sidebar.unknownPrincipal');
  const dateUnknownLabel = t('sidebar.dateUnknown');

  let status: 'loading' | 'error' | 'empty' | 'ready' = 'ready';
  if (isLoading) status = 'loading';
  else if (isError) status = 'error';
  else if (rows.length === 0) status = 'empty';

  return (
    <EntityListPanel
      title={tCommon('nav.events')}
      count={data?.length}
      action={
        <Button size="2" disabled>
          <Icon name="plus" size={16} />
          {t('sidebar.newButton')}
        </Button>
      }
      sort={{
        label: t('sidebar.sortLabel'),
        options: sortOptions,
        value: sort,
        onChange: setSort,
        disabled: rows.length === 0,
      }}
    >
      <EntityListBody
        status={status}
        skeletonRow={EVENTS_SKELETON_ROW}
        emptyIcon="calendar"
        emptyMessage={t('sidebar.empty')}
        errorMessage={tCommon('errors.loadFailed')}
      >
        {rows.map((event) => (
          <EventRow
            key={event.id}
            event={event}
            treeId={treeId}
            selected={event.id === params.eventId}
            unknownLabel={unknownLabel}
            dateUnknownLabel={dateUnknownLabel}
          />
        ))}
      </EntityListBody>
    </EntityListPanel>
  );
}
