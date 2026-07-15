import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EntityTable, type EntityTableColumn } from '$components/entity-table';
import { Icon } from '$components/icon';
import {
  DEFAULT_PERSON_EVENT_SCOPE,
  PersonEventsFilterToolbar,
  type PersonEventScope,
} from '$components/person-events-filters';
import { Badge } from '$components/ui/badge';
import { Button } from '$components/ui/button';
import { usePersonEvents } from '$hooks/usePersonEvents';
import { eventDateColumn, eventPlaceColumn, eventTypeColumn } from '$lib/event-columns';
import { principalsText } from '$lib/principals-text';
import type { PersonEventEntry } from '$db-tree/person-events';

import * as styles from './list-page.css';

interface PersonEventsPageProps {
  treeId: string;
  individualId: string;
}

/** Whether an entry is visible at the given cumulative scope level. */
function isVisibleAtLevel(entry: PersonEventEntry, level: PersonEventScope): boolean {
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

  const [scope, setScope] = useState<PersonEventScope>(DEFAULT_PERSON_EVENT_SCOPE);

  // The list arrives chronological from the manager; the Date column is not
  // sortable, so that natural order is preserved.
  const visibleRows = useMemo(
    () => (data ?? []).filter((entry) => isVisibleAtLevel(entry, scope)),
    [data, scope]
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
      // The list arrives chronological from the manager, so the Date column
      // stays unsortable to preserve that natural order.
      eventDateColumn(t),
      eventPlaceColumn(t),
      {
        key: 'details',
        header: tPerson('events.columns.details'),
        cell: (event) => {
          if (event.scope === 'secondary' && event.role) {
            return (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Badge>{t(`roles.${event.role}`)}</Badge>
                {principalsText(event.principals, unknownPrincipal)}
              </span>
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
    <div className={styles.page}>
      <div className={styles.toolbar} style={{ justifyContent: 'space-between' }}>
        <PersonEventsFilterToolbar value={scope} onChange={setScope} />
        <Button disabled>
          <Icon name="plus" />
          {t('page.addEvent')}
        </Button>
      </div>

      <div className={styles.tableWrapper}>
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
      </div>
    </div>
  );
}
