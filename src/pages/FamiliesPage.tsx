import { useMemo } from 'react';
import { Link as RouterLink, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Box, Link } from '@radix-ui/themes';

import { EntityTable, type EntityTableColumn } from '$components/entity-table';
import { useFamilies } from '$hooks/useFamilies';
import { sortByKey } from '$lib/sortByKey';
import { formatName } from '$db-tree/names';
import type { FamilyWithMembers, Name } from '$types/database';

interface FamiliesPageProps {
  treeId: string;
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

  const rows = useMemo(
    () =>
      data
        ? sortByKey(data, (family) =>
            family.husband ? formatName(family.husband.primaryName).sortable || null : null
          )
        : [],
    [data]
  );

  const columns = useMemo<EntityTableColumn<FamilyWithMembers>[]>(() => {
    const unknownSpouse = t('table.unknownSpouse');
    const spouseDisplay = (name: Name | null): string =>
      name ? formatName(name).surnameFirst : unknownSpouse;
    return [
      {
        key: 'husband',
        header: t('table.columns.husband'),
        rowHeader: true,
        cell: (family) => (
          <Link asChild onClick={(event) => event.stopPropagation()}>
            <RouterLink
              to="/tree/$treeId/family/$familyId"
              params={{ treeId, familyId: family.id }}
            >
              {spouseDisplay(family.husband?.primaryName ?? null)}
            </RouterLink>
          </Link>
        ),
      },
      {
        key: 'wife',
        header: t('table.columns.wife'),
        cell: (family) => spouseDisplay(family.wife?.primaryName ?? null),
      },
      {
        key: 'children',
        header: t('table.columns.children'),
        width: '120px',
        cell: (family) => family.children.length,
      },
    ];
  }, [t, treeId]);

  return (
    <Box p="4">
      <EntityTable
        label={tCommon('nav.families')}
        columns={columns}
        rows={rows}
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
        emptyMessage={t('table.empty')}
      />
    </Box>
  );
}
