import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Box, Button, Flex, Grid, Heading, Link } from '@radix-ui/themes';

import { EntityTable, type EntityTableColumn } from '$components/entity-table';
import { Icon, type IconName } from '$components/icon';
import {
  DEFAULT_INDIVIDUAL_FILTERS,
  hasActiveFilters,
  IndividualsFilters,
} from '$components/individuals-filters';
import { useDebouncedValue } from '$hooks/useDebouncedValue';
import { useIndividuals } from '$hooks/useIndividuals';
import { formatName, nameMatchesQuery } from '$db-tree/names';
import type { EventWithDetails, Gender, IndividualWithDetails } from '$types/database';

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
  const { data, isLoading, isError } = useIndividuals();

  const [filters, setFilters] = useState(DEFAULT_INDIVIDUAL_FILTERS);
  const debouncedName = useDebouncedValue(filters.name, 200);

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
        // A keyboard-focusable link (styled as plain text — no color/underline)
        // so the list is navigable without a pointer; the whole row is also
        // clickable via `onRowClick`, so the link stops propagation.
        cell: (person) => (
          <Link
            asChild
            color="gray"
            highContrast
            underline="none"
            onClick={(domEvent) => domEvent.stopPropagation()}
          >
            <RouterLink
              to="/tree/$treeId/individual/$individualId"
              params={{ treeId, individualId: person.id }}
            >
              {person.primaryName?.surname?.trim() || t('table.unknownName')}
            </RouterLink>
          </Link>
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

  return (
    <Box p="4">
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between" pt="2" pb="3">
          <Flex align="center" gap="3">
            <Icon name="user" size={28} />
            <Heading size="7" trim="both">
              {tCommon('nav.individuals')}
            </Heading>
          </Flex>
          <Button disabled>
            <Icon name="plus" />
            {t('page.addPerson')}
          </Button>
        </Flex>

        <Grid columns="280px 1fr" gap="4" align="start">
          <IndividualsFilters value={filters} onChange={setFilters} />
          <EntityTable
            label={tCommon('nav.individuals')}
            columns={columns}
            rows={visibleRows}
            getRowKey={(person) => person.id}
            onRowClick={(person) =>
              navigate({
                to: '/tree/$treeId/individual/$individualId',
                params: { treeId, individualId: person.id },
              })
            }
            isLoading={isLoading}
            isError={isError}
            errorMessage={tCommon('errors.loadFailed')}
            emptyMessage={hasActiveFilters(filters) ? t('table.noMatches') : t('table.empty')}
            defaultSort={{ columnKey: 'surname', direction: 'asc' }}
          />
        </Grid>
      </Flex>
    </Box>
  );
}
