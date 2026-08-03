import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import { Popover } from '$components/ui/popover';
import type { PeopleRailSort, PeopleRailSortField } from '$/store/app-store';
import * as styles from './person-rail.css';

const SORT_FIELDS: readonly PeopleRailSortField[] = [
  'surname',
  'firstName',
  'birthYear',
  'deathYear',
];
const SORT_DIRECTIONS: readonly PeopleRailSort['direction'][] = ['asc', 'desc'];

interface PeopleSortMenuProps {
  sort: PeopleRailSort;
  onChange: (sort: PeopleRailSort) => void;
}

/** The rail's sort control — a footer bar showing the current sort, opening a menu upward. */
export function PeopleSortMenu({ sort, onChange }: PeopleSortMenuProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.sortFooter}>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger className={styles.sortButton}>
          <Icon name="arrow-down-up" size={13} />
          <span>{t('rail.sort.trigger')}</span>
          <span className={styles.sortButtonField}>{t(`rail.sort.field.${sort.field}`)}</span>
          <span className={styles.sortButtonDirection}>{sort.direction === 'asc' ? '↑' : '↓'}</span>
          <span className={styles.sortButtonChevron}>
            <Icon name={open ? 'chevron-down' : 'chevron-up'} size={13} />
          </span>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner side="top" align="start" sideOffset={1}>
            <Popover.Popup className={styles.sortMenu}>
              <div className={styles.sortMenuLabel}>{t('rail.sort.menuLabel')}</div>
              {SORT_FIELDS.map((field) => (
                <button
                  key={field}
                  type="button"
                  className={styles.sortMenuItem}
                  onClick={() => {
                    onChange({ ...sort, field });
                    setOpen(false);
                  }}
                >
                  <span className={styles.sortMenuItemCheck}>
                    {field === sort.field && <Icon name="check" size={13} />}
                  </span>
                  <span>{t(`rail.sort.field.${field}`)}</span>
                </button>
              ))}
              <div className={styles.sortMenuDivider} />
              {SORT_DIRECTIONS.map((direction) => (
                <button
                  key={direction}
                  type="button"
                  className={styles.sortMenuItem}
                  onClick={() => {
                    onChange({ ...sort, direction });
                    setOpen(false);
                  }}
                >
                  <span className={styles.sortMenuItemCheck}>
                    {direction === sort.direction && <Icon name="check" size={13} />}
                  </span>
                  <span>{t(`rail.sort.direction.${direction}`)}</span>
                  <Icon name={direction === 'asc' ? 'chevron-up' : 'chevron-down'} size={13} />
                </button>
              ))}
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
