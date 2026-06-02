import { useMemo } from 'react';
import { Link as RouterLink, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Box, Link } from '@radix-ui/themes';

import { EntityTable, type EntityTableColumn } from '$components/entity-table';
import { usePlaces } from '$hooks/usePlaces';
import { sortByKey } from '$lib/sortByKey';
import type { Place } from '$types/database';

interface PlacesPageProps {
  treeId: string;
}

/**
 * The Places section page — the full-width table of every place in the
 * open tree. A row click opens that place's detail route.
 */
export function PlacesPage({ treeId }: PlacesPageProps): JSX.Element {
  const { t } = useTranslation('places');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { data, isLoading, isError } = usePlaces();

  const rows = useMemo(() => (data ? sortByKey(data, (place) => place.name) : []), [data]);

  const nameById = useMemo<Map<string, string>>(
    () => (data ? new Map(data.map((place) => [place.id, place.name])) : new Map()),
    [data]
  );

  const columns = useMemo<EntityTableColumn<Place>[]>(
    () => [
      {
        key: 'name',
        header: t('table.columns.name'),
        rowHeader: true,
        cell: (place) => (
          <Link asChild onClick={(event) => event.stopPropagation()}>
            <RouterLink to="/tree/$treeId/place/$placeId" params={{ treeId, placeId: place.id }}>
              {place.name}
            </RouterLink>
          </Link>
        ),
      },
      {
        key: 'parent',
        header: t('table.columns.parent'),
        cell: (place) => (place.parentId !== null ? (nameById.get(place.parentId) ?? '—') : '—'),
      },
    ],
    [t, treeId, nameById]
  );

  return (
    <Box p="4">
      <EntityTable
        label={tCommon('nav.places')}
        columns={columns}
        rows={rows}
        getRowKey={(place) => place.id}
        onRowClick={(place) =>
          navigate({ to: '/tree/$treeId/place/$placeId', params: { treeId, placeId: place.id } })
        }
        isLoading={isLoading}
        isError={isError}
        errorMessage={tCommon('errors.loadFailed')}
        emptyMessage={t('table.empty')}
      />
    </Box>
  );
}
