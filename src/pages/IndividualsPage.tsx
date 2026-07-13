import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { EntityTable, rowLink, type EntityTableColumn } from '$components/entity-table';
import { Icon, type IconName } from '$components/icon';
import { PersonEditorDialog } from '$components/individuals/person-editor-dialog';
import {
  DEFAULT_INDIVIDUAL_FILTERS,
  hasActiveFilters,
  IndividualsFilterToolbar,
} from '$components/individuals-filters';
import { Button } from '$components/ui/button';
import { Typography } from '$components/ui/typography';
import { useDebouncedValue } from '$hooks/useDebouncedValue';
import { useIndividuals } from '$hooks/useIndividuals';
import { formatName, nameMatchesQuery } from '$db-tree/names';
import type { EventWithDetails, Gender, IndividualWithDetails } from '$types/database';

import * as styles from './IndividualsPage.css';

interface IndividualsPageProps {
  treeId: string;
}

/** The genealogical symbol used to convey each sex in the leading column. */
const GENDER_ICON: Record<Gender, IconName> = {
  M: 'mars',
  F: 'venus',
  U: 'circle-help',
};

/**
 * Column widths keyed by the kind of data each column holds, so columns of
 * the same type (the two names, the two dates, the two places) stay visually
 * uniform regardless of their individual contents.
 */
const COLUMN_WIDTH = {
  gender: '40px',
  name: '180px',
  date: '140px',
  place: '220px',
} as const;

/**
 * Display date for an event: the original (as-entered) date when present,
 * otherwise the year from the normalized sort date. Returns an em dash when
 * the event has no date at all.
 */
function eventDate(event: EventWithDetails | null): string {
  const date = event?.dateOriginal ?? (event?.dateSort ? event.dateSort.slice(0, 4) : null);
  return date ?? '—';
}

/** Display place name for an event, or an em dash when none is recorded. */
function eventPlace(event: EventWithDetails | null): string {
  return event?.place?.name ?? '—';
}

/**
 * The People section page — the full-width table of every person in the
 * open tree. A row click opens that individual's detail route.
 */
export function IndividualsPage({ treeId }: IndividualsPageProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useIndividuals();

  const [filters, setFilters] = useState(DEFAULT_INDIVIDUAL_FILTERS);
  const debouncedName = useDebouncedValue(filters.name, 200);
  const [createOpen, setCreateOpen] = useState(false);

  // Filter the already-loaded list client-side over the same fields the
  // backend can express: every name, sex, and living status (all AND-ed).
  // Ordering is handled by the table (sortable headers); see `defaultSort`.
  const visibleRows = useMemo(() => {
    const query = debouncedName.trim().toLowerCase();
    return (data ?? []).filter((person) => {
      if (filters.sex !== 'all' && person.gender !== filters.sex) return false;
      if (filters.status === 'living' && !person.isLiving) return false;
      if (filters.status === 'deceased' && person.isLiving) return false;
      if (query && !nameMatchesQuery(person.names, query)) return false;
      return true;
    });
  }, [data, filters.sex, filters.status, debouncedName]);

  const columns = useMemo<EntityTableColumn<IndividualWithDetails>[]>(
    () => [
      {
        key: 'gender',
        header: '',
        // The header is icon-column-empty; name it for assistive tech since
        // this column stands in for the removed "Sex" text column.
        headerLabel: t('table.columns.sex'),
        width: COLUMN_WIDTH.gender,
        // gender is constrained to M/F/U by the schema; the icon carries the
        // sex (the dedicated Sex column was removed), so it is announced.
        cell: (person) => (
          <Icon
            name={GENDER_ICON[person.gender] ?? 'circle-help'}
            aria-hidden={false}
            aria-label={t(`table.sex.${person.gender}`, { defaultValue: t('table.sex.U') })}
          />
        ),
      },
      {
        key: 'surname',
        header: t('table.columns.surname'),
        rowHeader: true,
        width: COLUMN_WIDTH.name,
        // A real router link makes the row keyboard-focusable and gives
        // native Enter / ⌘-click behavior; the table derives the full-row
        // click from this same link.
        cell: (person) => (
          <RouterLink
            to="/tree/$treeId/individual/$individualId"
            params={{ treeId, individualId: person.id }}
            className={rowLink}
          >
            {person.primaryName?.surname?.trim() || t('table.unknownName')}
          </RouterLink>
        ),
        // Sort by "Surname, Given" so same-surname people fall in given-name order.
        sortValue: (person) => formatName(person.primaryName).sortable || null,
      },
      {
        key: 'firstName',
        header: t('table.columns.firstName'),
        width: COLUMN_WIDTH.name,
        cell: (person) => person.primaryName?.givenNames?.trim() || '—',
        sortValue: (person) => person.primaryName?.givenNames?.trim() || null,
      },
      {
        key: 'birthDate',
        header: t('table.columns.birthDate'),
        width: COLUMN_WIDTH.date,
        cell: (person) => eventDate(person.birthEvent),
      },
      {
        key: 'birthPlace',
        header: t('table.columns.birthPlace'),
        width: COLUMN_WIDTH.place,
        cell: (person) => eventPlace(person.birthEvent),
      },
      {
        key: 'deathDate',
        header: t('table.columns.deathDate'),
        width: COLUMN_WIDTH.date,
        cell: (person) => (person.isLiving ? '—' : eventDate(person.deathEvent)),
      },
      {
        key: 'deathPlace',
        header: t('table.columns.deathPlace'),
        width: COLUMN_WIDTH.place,
        cell: (person) => (person.isLiving ? '—' : eventPlace(person.deathEvent)),
      },
    ],
    [t, treeId]
  );

  const filtered = hasActiveFilters(filters);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.title}>
          <Icon name="user" size={28} />
          <Typography as="h1" size="16" weight="650">
            {tCommon('nav.individuals')}
          </Typography>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Icon name="plus" />
          {t('page.addPerson')}
        </Button>
      </header>

      <div className={styles.toolbar}>
        <IndividualsFilterToolbar value={filters} onChange={setFilters} />
      </div>

      <div className={styles.tableWrapper}>
        <EntityTable
          label={tCommon('nav.individuals')}
          columns={columns}
          rows={visibleRows}
          getRowKey={(person) => person.id}
          isLoading={isLoading}
          isError={isError}
          errorMessage={tCommon('errors.loadFailed')}
          emptyMessage={t('table.empty')}
          emptyAction={{
            label: t('page.addPerson'),
            onClick: () => setCreateOpen(true),
          }}
          noMatchesMessage={t('table.noMatches')}
          noMatchesAction={{
            label: tCommon('filters.clear'),
            onClick: () => setFilters(DEFAULT_INDIVIDUAL_FILTERS),
          }}
          isFiltered={filtered}
          defaultSort={{ columnKey: 'surname', direction: 'asc' }}
        />
      </div>

      <PersonEditorDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={(individualId) => {
          setCreateOpen(false);
          void refetch();
          navigate({
            to: '/tree/$treeId/individual/$individualId',
            params: { treeId, individualId },
          });
        }}
      />
    </div>
  );
}
