import { useMemo, useState } from 'react';
import { Link as RouterLink } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { EntityTable, rowLink, type EntityTableColumn } from '$components/entity-table';
import {
  DEFAULT_FAMILY_FILTERS,
  FamiliesFilterToolbar,
  hasActiveFilters,
  type FamilyFilters,
} from '$components/families-filters';
import { Icon } from '$components/icon';
import { Button } from '$components/ui/button';
import { Typography } from '$components/ui/typography';
import { useDebouncedValue } from '$hooks/useDebouncedValue';
import { useFamilies } from '$hooks/useFamilies';
import { formatName, nameMatchesQuery } from '$db-tree/names';
import type { FamilyWithMembers, IndividualWithDetails } from '$types/database';

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

/** Whether any of the spouse's names matches the (lower-cased) query. */
function spouseMatches(spouse: IndividualWithDetails | null, query: string): boolean {
  return spouse !== null && nameMatchesQuery(spouse.names, query);
}

/**
 * The Families section page — the full-width table of every family in the
 * open tree. A row click opens that family's detail route.
 */
export function FamiliesPage({ treeId }: FamiliesPageProps): JSX.Element {
  const { t } = useTranslation('families');
  const { t: tCommon } = useTranslation('common');
  const { data, isLoading, isError } = useFamilies();

  const [filters, setFilters] = useState(DEFAULT_FAMILY_FILTERS);
  const debouncedName = useDebouncedValue(filters.name, 200);

  // Filter the already-loaded list client-side: spouse-name search (both
  // spouses), spouse completeness, and children presence (all AND-ed).
  // Ordering is handled by the table (sortable headers); see `defaultSort`.
  const visibleRows = useMemo(() => {
    const query = debouncedName.trim().toLowerCase();
    return (data ?? []).filter((family) => {
      const hasHusband = family.husband !== null;
      const hasWife = family.wife !== null;
      // Positive predicate per option — reads as the plain definition of each
      // choice, avoiding the double-negation of an "if X and not X" chain.
      const spouseOk: Record<FamilyFilters['spouses'], boolean> = {
        all: true,
        both: hasHusband && hasWife,
        missingHusband: !hasHusband && hasWife,
        missingWife: hasHusband && !hasWife,
        none: !hasHusband && !hasWife,
      };
      if (!spouseOk[filters.spouses]) return false;

      const hasChildren = family.children.length > 0;
      if (filters.children === 'with' && !hasChildren) return false;
      if (filters.children === 'without' && hasChildren) return false;

      if (query && !spouseMatches(family.husband, query) && !spouseMatches(family.wife, query)) {
        return false;
      }
      return true;
    });
  }, [data, filters.spouses, filters.children, debouncedName]);

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
          <Typography as="h1" size="16" weight="650">
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
          rows={visibleRows}
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
          defaultSort={{ columnKey: 'husband', direction: 'asc' }}
        />
      </div>
    </div>
  );
}
