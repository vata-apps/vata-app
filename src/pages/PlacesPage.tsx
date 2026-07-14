import { useMemo, useState } from 'react';
import { Link as RouterLink } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { EntityTable, rowLink, type EntityTableColumn } from '$components/entity-table';
import { Icon } from '$components/icon';
import {
  DEFAULT_PLACE_FILTERS,
  hasActiveFilters,
  PlacesFilterToolbar,
  type PlaceTypeOption,
} from '$components/places-filters';
import { Button } from '$components/ui/button';
import { Typography } from '$components/ui/typography';
import { useDebouncedValue } from '$hooks/useDebouncedValue';
import { usePlaces } from '$hooks/usePlaces';
import { usePlaceTypes } from '$hooks/usePlaceTypes';
import { placeTypeLabel } from '$lib/placeTypeLabel';
import type { Place } from '$types/database';

import * as styles from './list-page.css';

interface PlacesPageProps {
  treeId: string;
}

/**
 * Column widths keyed by the kind of data each column holds, so columns of
 * the same type stay visually uniform regardless of their contents.
 */
const COLUMN_WIDTH = {
  name: '280px',
  type: '180px',
} as const;

/**
 * The Places section page — the full-width table of every place in the
 * open tree. A row click opens that place's detail route.
 */
export function PlacesPage({ treeId }: PlacesPageProps): JSX.Element {
  const { t } = useTranslation('places');
  const { t: tCommon } = useTranslation('common');
  const { data, isLoading, isError } = usePlaces();
  const { data: placeTypes } = usePlaceTypes();

  const [filters, setFilters] = useState(DEFAULT_PLACE_FILTERS);
  const debouncedName = useDebouncedValue(filters.name, 200);

  // The place name keyed by id, for resolving the Parent column.
  const nameById = useMemo<Map<string, string>>(
    () => (data ? new Map(data.map((place) => [place.id, place.name])) : new Map()),
    [data]
  );

  // The place-type label keyed by type id, for the Type column and select.
  const typeLabelById = useMemo<Map<string, string>>(
    () => new Map((placeTypes ?? []).map((type) => [type.id, placeTypeLabel(type)])),
    [placeTypes]
  );

  // The Type filter offers every place type present in the tree, by label.
  const typeOptions = useMemo<PlaceTypeOption[]>(
    () =>
      (placeTypes ?? [])
        .map((type) => ({ value: type.id, label: placeTypeLabel(type) }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [placeTypes]
  );

  // Filter the already-loaded list client-side: name search (name + full
  // name) and place type (both AND-ed). Ordering is handled by the table
  // (sortable headers); see `defaultSort`.
  const visibleRows = useMemo(() => {
    const query = debouncedName.trim().toLowerCase();
    return (data ?? []).filter((place) => {
      if (filters.type !== 'all' && place.placeTypeId !== filters.type) return false;
      if (
        query &&
        !place.name.toLowerCase().includes(query) &&
        !place.fullName.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [data, filters.type, debouncedName]);

  const columns = useMemo<EntityTableColumn<Place>[]>(
    () => [
      {
        key: 'name',
        header: t('table.columns.name'),
        rowHeader: true,
        width: COLUMN_WIDTH.name,
        // A real router link makes the row keyboard-focusable and gives
        // native Enter / ⌘-click behavior; the table derives the full-row
        // click from this same link.
        cell: (place) => (
          <RouterLink
            to="/tree/$treeId/place/$placeId"
            params={{ treeId, placeId: place.id }}
            className={rowLink}
          >
            {place.name}
          </RouterLink>
        ),
        sortValue: (place) => place.name || null,
      },
      {
        key: 'type',
        header: t('table.columns.type'),
        width: COLUMN_WIDTH.type,
        cell: (place) =>
          place.placeTypeId !== null ? (typeLabelById.get(place.placeTypeId) ?? '—') : '—',
        sortValue: (place) =>
          place.placeTypeId !== null ? (typeLabelById.get(place.placeTypeId) ?? null) : null,
      },
      {
        key: 'parent',
        header: t('table.columns.parent'),
        cell: (place) => (place.parentId !== null ? (nameById.get(place.parentId) ?? '—') : '—'),
        sortValue: (place) =>
          place.parentId !== null ? (nameById.get(place.parentId) ?? null) : null,
      },
    ],
    [t, treeId, nameById, typeLabelById]
  );

  const filtered = hasActiveFilters(filters);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.title}>
          <Icon name="map-pin" size={28} />
          <Typography as="h1" size="16" weight="650">
            {tCommon('nav.places')}
          </Typography>
        </div>
        <Button disabled>
          <Icon name="plus" />
          {t('page.addPlace')}
        </Button>
      </header>

      <div className={styles.toolbar}>
        <PlacesFilterToolbar value={filters} onChange={setFilters} types={typeOptions} />
      </div>

      <div className={styles.tableWrapper}>
        <EntityTable
          label={tCommon('nav.places')}
          columns={columns}
          rows={visibleRows}
          getRowKey={(place) => place.id}
          isLoading={isLoading}
          isError={isError}
          errorMessage={tCommon('errors.loadFailed')}
          emptyMessage={t('table.empty')}
          noMatchesMessage={t('table.noMatches')}
          noMatchesAction={{
            label: tCommon('filters.clear'),
            onClick: () => setFilters(DEFAULT_PLACE_FILTERS),
          }}
          isFiltered={filtered}
          defaultSort={{ columnKey: 'name', direction: 'asc' }}
        />
      </div>
    </div>
  );
}
