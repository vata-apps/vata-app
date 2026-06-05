import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Box, Button, Flex, Grid, Heading, Link } from '@radix-ui/themes';

import { EntityTable, type EntityTableColumn } from '$components/entity-table';
import {
  DEFAULT_FAMILY_FILTERS,
  FamiliesFilters,
  type FamilyFilters,
  hasActiveFilters,
} from '$components/families-filters';
import { Icon } from '$components/icon';
import { useDebouncedValue } from '$hooks/useDebouncedValue';
import { useFamilies } from '$hooks/useFamilies';
import { formatName, nameMatchesQuery } from '$db-tree/names';
import type { FamilyWithMembers, IndividualWithDetails } from '$types/database';

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
  const navigate = useNavigate();
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
        // A keyboard-focusable link (styled as plain text) so the list is
        // navigable without a pointer; the whole row is also clickable via
        // `onRowClick`, so the link stops propagation.
        cell: (family) => (
          <Link
            asChild
            color="gray"
            highContrast
            underline="none"
            onClick={(domEvent) => domEvent.stopPropagation()}
          >
            <RouterLink
              to="/tree/$treeId/family/$familyId"
              params={{ treeId, familyId: family.id }}
            >
              {family.husband?.primaryName
                ? formatName(family.husband.primaryName).surnameFirst
                : t('table.unknownName')}
            </RouterLink>
          </Link>
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

  return (
    <Box p="4">
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between" pt="2" pb="3">
          <Flex align="center" gap="3">
            <Icon name="users" size={28} />
            <Heading size="7" trim="both">
              {tCommon('nav.families')}
            </Heading>
          </Flex>
          <Button disabled>
            <Icon name="plus" />
            {t('page.addFamily')}
          </Button>
        </Flex>

        <Grid columns="280px 1fr" gap="4" align="start">
          <FamiliesFilters value={filters} onChange={setFilters} />
          <EntityTable
            label={tCommon('nav.families')}
            columns={columns}
            rows={visibleRows}
            getRowKey={(family) => family.id}
            onRowClick={(family) =>
              navigate({
                to: '/tree/$treeId/family/$familyId',
                params: { treeId, familyId: family.id },
              })
            }
            isLoading={isLoading}
            isError={isError}
            errorMessage={tCommon('errors.loadFailed')}
            emptyMessage={hasActiveFilters(filters) ? t('table.noMatches') : t('table.empty')}
            defaultSort={{ columnKey: 'husband', direction: 'asc' }}
          />
        </Grid>
      </Flex>
    </Box>
  );
}
