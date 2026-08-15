import { useMemo, useState } from 'react';
import { Link as RouterLink } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import {
  EntityTable,
  rowLink,
  type EntityTableColumn,
  type EntityTableSort,
} from '$components/entity-table';
import {
  DEFAULT_FAMILY_FILTERS,
  FamiliesFilterToolbar,
  hasActiveFilters,
} from '$components/families-filters';
import { Icon } from '$components/icon';
import { Button } from '$components/ui/button';
import { Typography } from '$components/ui/typography';
import { useDebouncedValue } from '$hooks/useDebouncedValue';
import { useFamiliesPage } from '$hooks/useFamilies';
import { formatName } from '$db-tree/names';
import type { FamiliesSortColumn } from '$db-tree/families';
import type { FamilyWithMembers } from '$types/database';

import * as styles from './list-page.css';

interface FamiliesPageProps {
  treeId: string;
}

/**
 * Column widths keyed by the kind of data each column holds, so the two
 * spouse-name columns stay visually uniform regardless of their contents.
 */
const COLUMN_WIDTH = {
  name: '280px',
  children: '120px',
} as const;

/**
 * The Families section page — the full-width table of every family in the
 * open tree. A row click opens that family's detail route.
 */
export function FamiliesPage({ treeId }: FamiliesPageProps): JSX.Element {
  const { t } = useTranslation('families');
  const { t: tCommon } = useTranslation('common');

  const [filters, setFilters] = useState(DEFAULT_FAMILY_FILTERS);
  const debouncedName = useDebouncedValue(filters.name, 200);
  const [sort, setSort] = useState<EntityTableSort>({ columnKey: 'husband', direction: 'asc' });

  // Filtering, sorting, and paging all happen in SQL (see issue #266) — the
  // page only shapes the query params and flattens the loaded pages.
  const sortColumn: FamiliesSortColumn =
    sort.columnKey === 'wife' || sort.columnKey === 'children' ? sort.columnKey : 'husband';
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFamiliesPage({
      filters: { nameQuery: debouncedName, spouses: filters.spouses, children: filters.children },
      sortColumn,
      sortDirection: sort.direction,
    });

  const rows = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const columns = useMemo<EntityTableColumn<FamilyWithMembers>[]>(
    () => [
      {
        key: 'husband',
        header: t('table.columns.husband'),
        rowHeader: true,
        width: COLUMN_WIDTH.name,
        // A real router link makes the row keyboard-focusable and gives
        // native Enter / ⌘-click behavior; the table derives the full-row
        // click from this same link.
        cell: (family) => (
          <RouterLink
            to="/tree/$treeId/family/$familyId"
            params={{ treeId, familyId: family.id }}
            className={rowLink}
          >
            {family.husband?.primaryName
              ? formatName(family.husband.primaryName).surnameFirst
              : t('table.unknownName')}
          </RouterLink>
        ),
        // Sort by "Surname, Given" so same-surname spouses fall in given order.
        sortValue: (family) => formatName(family.husband?.primaryName ?? null).sortable || null,
      },
      {
        key: 'wife',
        header: t('table.columns.wife'),
        width: COLUMN_WIDTH.name,
        cell: (family) =>
          family.wife?.primaryName
            ? formatName(family.wife.primaryName).surnameFirst
            : t('table.unknownName'),
        sortValue: (family) => formatName(family.wife?.primaryName ?? null).sortable || null,
      },
      {
        key: 'children',
        header: t('table.columns.children'),
        width: COLUMN_WIDTH.children,
        cell: (family) => family.children.length,
        sortValue: (family) => family.children.length,
      },
    ],
    [t, treeId]
  );

  const filtered = hasActiveFilters(filters);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.title}>
          <Icon name="users" size={28} />
          <Typography as="h1" size="lg" weight="strong">
            {tCommon('nav.families')}
          </Typography>
        </div>
        <Button disabled>
          <Icon name="plus" />
          {t('page.addFamily')}
        </Button>
      </header>

      <div className={styles.toolbar}>
        <FamiliesFilterToolbar value={filters} onChange={setFilters} />
      </div>

      <div className={styles.tableWrapper}>
        <EntityTable
          label={tCommon('nav.families')}
          columns={columns}
          rows={rows}
          getRowKey={(family) => family.id}
          isLoading={isLoading}
          isError={isError}
          errorMessage={tCommon('errors.loadFailed')}
          emptyMessage={t('table.empty')}
          noMatchesMessage={t('table.noMatches')}
          noMatchesAction={{
            label: tCommon('filters.clear'),
            onClick: () => setFilters(DEFAULT_FAMILY_FILTERS),
          }}
          isFiltered={filtered}
          sort={sort}
          onSortChange={setSort}
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
