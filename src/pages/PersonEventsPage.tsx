import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Flex, SegmentedControl } from '@radix-ui/themes';

import { EntityTable, type EntityTableColumn } from '$components/entity-table';
import { Icon } from '$components/icon';
import { usePersonEvents } from '$hooks/usePersonEvents';
import { eventDateColumn, eventPlaceColumn, eventTypeColumn } from '$lib/event-columns';
import { principalsText } from '$lib/principals-text';
import type { PersonEventEntry } from '$db-tree/person-events';

interface PersonEventsPageProps {
  treeId: string;
  individualId: string;
}

/**
 * The graduated scope filter. Each level is cumulative:
 * - `principal` — the person's own principal events only.
 * - `personal` — adds their unions (marriages, divorces).
 * - `all` — adds their secondary roles in others' events (witness, …).
 */
type ScopeLevel = 'principal' | 'personal' | 'all';
const DEFAULT_LEVEL: ScopeLevel = 'personal';

/** Whether an entry is visible at the given cumulative scope level. */
function isVisibleAtLevel(entry: PersonEventEntry, level: ScopeLevel): boolean {
  if (level === 'all') return true;
  if (level === 'personal') return entry.scope !== 'secondary';
  return entry.scope === 'principal';
}

/**
 * The Events tab of a person: every event connected to them, filtered by a
 * cumulative scope level. A row click opens that event's detail route.
 */
export function PersonEventsPage({ treeId, individualId }: PersonEventsPageProps): JSX.Element {
  const { t } = useTranslation('events');
  const { t: tPerson } = useTranslation('individuals');
  const { t: tCommon } = useTranslation('common');
  const { data, isLoading, isError } = usePersonEvents(individualId);

  const [level, setLevel] = useState<ScopeLevel>(DEFAULT_LEVEL);

  const visibleRows = useMemo(
    () => (data ?? []).filter((entry) => isVisibleAtLevel(entry, level)),
    [data, level]
  );

  const columns = useMemo<EntityTableColumn<PersonEventEntry>[]>(() => {
    const unknownPrincipal = t('table.unknownPrincipal');

    // The `details` column carries the person's relationship to the event: the
    // spouse for a union, the role plus the event's own principal(s) for a
    // secondary participation (whose event is this?), nothing for a principal
    // event. `detailText` is the sortable/plain form; the cell wraps the role
    // in a Badge and shows an em dash for a spouse-less union.
    const detailText = (event: PersonEventEntry): string | null => {
      if (event.scope === 'union') return event.counterpartyName;
      if (event.scope === 'secondary' && event.role) {
        return `${t(`roles.${event.role}`)} ${principalsText(event.principals, unknownPrincipal)}`;
      }
      return null;
    };

    return [
      eventTypeColumn(treeId, t),
      eventDateColumn(t, { sortable: true }),
      eventPlaceColumn(t),
      {
        key: 'details',
        header: tPerson('events.columns.details'),
        cell: (event) => {
          if (event.scope === 'secondary' && event.role) {
            return (
              <Flex gap="2" align="center">
                <Badge variant="soft" color="gray" radius="full">
                  {t(`roles.${event.role}`)}
                </Badge>
                {principalsText(event.principals, unknownPrincipal)}
              </Flex>
            );
          }
          if (event.scope === 'union') return event.counterpartyName ?? '—';
          return null;
        },
        sortValue: detailText,
      },
    ];
  }, [t, tPerson, treeId]);

  return (
    <Flex direction="column" gap="4">
      <Flex align="center" justify="between">
        <SegmentedControl.Root
          value={level}
          onValueChange={(value) => setLevel(value as ScopeLevel)}
        >
          <SegmentedControl.Item value="principal">
            {tPerson('events.scope.principal')}
          </SegmentedControl.Item>
          <SegmentedControl.Item value="personal">
            {tPerson('events.scope.personal')}
          </SegmentedControl.Item>
          <SegmentedControl.Item value="all">{tPerson('events.scope.all')}</SegmentedControl.Item>
        </SegmentedControl.Root>
        <Button disabled>
          <Icon name="plus" />
          {t('page.addEvent')}
        </Button>
      </Flex>

      <EntityTable
        label={tPerson('overview.tabs.events')}
        columns={columns}
        rows={visibleRows}
        getRowKey={(event) => event.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={tCommon('errors.loadFailed')}
        emptyMessage={tPerson('events.empty')}
      />
    </Flex>
  );
}
