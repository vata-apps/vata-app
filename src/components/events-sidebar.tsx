import React, { type ReactNode, useMemo, useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button, Card, Flex, Skeleton, Text } from '@radix-ui/themes';

import { EntityListPanel, type EntityListSortOption } from './entity-list-panel';
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

const SKELETON_ROW_COUNT = 7;

/** Display name for a single principal name slot — italic unknown when null. */
function PrincipalName({
  name,
  unknownLabel,
}: {
  name: Name | null;
  unknownLabel: string;
}): JSX.Element {
  if (!name) {
    return (
      <Text size="2" weight="medium" color="gray" aria-label={unknownLabel} truncate>
        {unknownLabel}
      </Text>
    );
  }
  const display = formatName(name).full;
  return (
    <Text size="2" weight="medium" truncate>
      {display || unknownLabel}
    </Text>
  );
}

/** Renders the principal line(s) for an event row. */
function PrincipalsBlock({
  principals,
  unknownLabel,
}: {
  principals: EventPrincipal[];
  unknownLabel: string;
}): JSX.Element {
  if (principals.length === 0) {
    return (
      <Text size="2" weight="medium" color="gray" truncate>
        {unknownLabel}
      </Text>
    );
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

/** The meta line: date · 📍 place (or whichever parts are present). */
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

  return (
    <Text size="1" color="gray" truncate>
      {parts.join(' · ')}
    </Text>
  );
}

/** Sort events by date, NULLs last. */
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
    <Card asChild size="1" variant={selected ? 'surface' : 'ghost'}>
      <Link
        to="/tree/$treeId/event/$eventId"
        params={{ treeId, eventId: event.id }}
        aria-current={selected ? 'page' : undefined}
      >
        <Flex align="center" gap="2">
          <Flex direction="column" flexGrow="1" minWidth="0">
            <Text size="1" color="gray" weight="medium" truncate>
              {label}
            </Text>
            <PrincipalsBlock principals={event.principals} unknownLabel={unknownLabel} />
            <MetaLine event={event} dateUnknownLabel={dateUnknownLabel} />
          </Flex>
          <Icon name="chevron-right" size={14} />
        </Flex>
      </Link>
    </Card>
  );
}

function EventsListSkeleton(): JSX.Element {
  return (
    <Flex direction="column" gap="1" p="2" aria-hidden="true">
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <Flex key={index} direction="column" gap="1" px="2" py="2">
          <Skeleton width="40%" height="10px" />
          <Skeleton width="70%" height="12px" />
          <Skeleton width="55%" height="10px" />
        </Flex>
      ))}
    </Flex>
  );
}

function EventsListMessage({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: boolean;
}): JSX.Element {
  return (
    <Flex direction="column" align="center" justify="center" gap="2" px="5" py="8">
      {icon && (
        <Text color="gray" asChild>
          <span>
            <Icon name="calendar" size={24} />
          </span>
        </Text>
      )}
      <Text size="2" color="gray" align="center">
        {children}
      </Text>
    </Flex>
  );
}

/**
 * The Events section sidebar — the list of every event in the open tree,
 * rendered in the in-tree shell's left column. Header (title, count, a
 * disabled "New" button), the scrollable event list, and a sort footer.
 *
 * Each row shows the event type as an uppercase eyebrow, the principal
 * name(s) below (italic Unknown when missing), and a meta line with the
 * date and place. Marriage rows stack both spouse names.
 *
 * Composed on top of {@link EntityListPanel}, the same reusable shell
 * used by the People sidebar.
 */
export function EventsSidebar(): JSX.Element | null {
  const { t } = useTranslation('events');
  const { t: tCommon } = useTranslation('common');
  const params = useParams({ strict: false });
  const { data, isLoading, isError } = useEvents();
  const [sort, setSort] = useState<SortValue>('date-asc');

  const rows = useMemo(() => (data ? sortEvents(data, sort) : []), [data, sort]);

  const sortOptions = useMemo<EntityListSortOption<SortValue>[]>(
    () => SORT_VALUES.map((value) => ({ value, label: t(SORT_LABEL_KEYS[value]) })),
    [t]
  );

  const treeId = params.treeId;
  if (treeId === undefined) return null;

  const unknownLabel = t('sidebar.unknownPrincipal');
  const dateUnknownLabel = t('sidebar.dateUnknown');

  const body: ReactNode = ((): ReactNode => {
    if (isLoading) return <EventsListSkeleton />;
    if (isError) return <EventsListMessage>{tCommon('errors.loadFailed')}</EventsListMessage>;
    if (rows.length === 0) return <EventsListMessage icon>{t('sidebar.empty')}</EventsListMessage>;
    return (
      <Flex direction="column" gap="1" p="2">
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
      </Flex>
    );
  })();

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
      {body}
    </EntityListPanel>
  );
}
