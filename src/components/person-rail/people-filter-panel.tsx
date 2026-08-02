import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import { Button } from '$components/ui/button';
import { Popover } from '$components/ui/popover';
import { DEFAULT_PEOPLE_RAIL_FILTERS, type PeopleRailFilters } from '$/store/app-store';
import type { Gender, IndividualWithDetails } from '$types/database';
import { countPeopleRailFilterValues, matchesPeopleRailFilters } from './person-rail-data';
import * as styles from './person-rail.css';

interface FilterField {
  key: keyof PeopleRailFilters;
  labelKey: string;
  values: readonly string[];
}

const FILTER_FIELDS: readonly FilterField[] = [
  { key: 'sex', labelKey: 'rail.filters.sex', values: ['M', 'F', 'U'] satisfies Gender[] },
  { key: 'status', labelKey: 'rail.filters.status', values: ['living', 'deceased'] },
];

interface PeopleFilterPanelProps {
  people: IndividualWithDetails[];
  filters: PeopleRailFilters;
  onApply: (filters: PeopleRailFilters) => void;
}

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

/**
 * The rail's filter control — button + popover. The popover works on a
 * **draft**: checked values only take effect when "View N people" is
 * clicked, and each value shows the count it would yield on its own
 * (OR within the field). Re-initialized from the committed `filters` every
 * time it opens, so a dismissed draft never leaks into the next open.
 */
export function PeopleFilterPanel({
  people,
  filters,
  onApply,
}: PeopleFilterPanelProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const hasFilters = filters.sex.length > 0 || filters.status.length > 0;
  const summary = [
    ...filters.sex.map((v) => t(`table.sex.${v}`)),
    ...filters.status.map((v) => t(`rail.filters.statusValue.${v}`)),
  ].join(', ');

  // Counts depend only on `people`, not the draft — see countPeopleRailFilterValues.
  const valueCounts = useMemo(() => countPeopleRailFilterValues(people), [people]);
  const resultCount = useMemo(
    () => people.filter((person) => matchesPeopleRailFilters(person, draft)).length,
    [people, draft]
  );

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className={styles.filterButton}>
        <Icon name="sliders-horizontal" size={13} />
        <span className={styles.filterButtonLabel}>{t('rail.filters.title')}</span>
        {hasFilters && <span className={styles.filterButtonSummary}>· {summary}</span>}
        {hasFilters && (
          <span
            role="button"
            tabIndex={0}
            className={styles.filterButtonClear}
            title={t('rail.filters.reset')}
            onClick={(event) => {
              event.stopPropagation();
              onApply(DEFAULT_PEOPLE_RAIL_FILTERS);
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              event.stopPropagation();
              onApply(DEFAULT_PEOPLE_RAIL_FILTERS);
            }}
          >
            <Icon name="x" size={13} />
          </span>
        )}
        <span className={styles.filterButtonChevron}>
          <Icon name={open ? 'chevron-up' : 'chevron-down'} size={13} />
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4} align="start">
          <Popover.Popup className={styles.filterPanel}>
            <div className={styles.filterPanelHeader}>
              <span className={styles.filterPanelTitle}>{t('rail.filters.title')}</span>
              <button
                type="button"
                className={styles.filterPanelReset}
                onClick={() => setDraft(DEFAULT_PEOPLE_RAIL_FILTERS)}
              >
                {t('rail.filters.reset')}
              </button>
              <Popover.Close aria-label={t('rail.filters.close')}>
                <Icon name="x" size={15} />
              </Popover.Close>
            </div>

            <div className={styles.filterPanelBody}>
              {FILTER_FIELDS.map((field) => (
                <div key={field.key}>
                  <div className={styles.filterSectionLabel}>{t(field.labelKey)}</div>
                  <div className={styles.filterValues}>
                    {field.values.map((value) => {
                      const checked = (draft[field.key] as string[]).includes(value);
                      const count = (valueCounts[field.key] as Record<string, number>)[value];
                      const label =
                        field.key === 'sex'
                          ? t(`table.sex.${value}`)
                          : t(`rail.filters.statusValue.${value}`);
                      return (
                        <button
                          key={value}
                          type="button"
                          className={styles.filterValueRow}
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              [field.key]: toggleValue(prev[field.key] as string[], value),
                            }))
                          }
                        >
                          <span
                            className={
                              checked
                                ? `${styles.filterValueBox} ${styles.filterValueBoxChecked}`
                                : styles.filterValueBox
                            }
                          >
                            {checked && <Icon name="check" size={11} />}
                          </span>
                          <span className={styles.filterValueLabel}>{label}</span>
                          <span className={styles.filterValueCount}>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.filterPanelFooter}>
              <Button
                onClick={() => {
                  onApply(draft);
                  setOpen(false);
                }}
              >
                {t('rail.filters.apply', { count: resultCount })}
              </Button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
