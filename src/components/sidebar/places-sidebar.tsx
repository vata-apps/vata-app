import { useMemo, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button, Flex, Skeleton } from '@radix-ui/themes';

import { EntityListPanel } from './entity-list-panel';
import { EntityListBody } from './entity-list-body';
import { SidebarRow } from './sidebar-row';
import { buildSortOptions } from './sort-helpers';
import { Icon } from '$components/icon';
import { usePlaces } from '$hooks/usePlaces';
import type { Place } from '$types/database';

const SORT_VALUES = ['name-asc', 'name-desc'] as const;
type SortValue = (typeof SORT_VALUES)[number];

const SORT_LABEL_KEYS: Record<SortValue, string> = {
  'name-asc': 'sidebar.sort.nameAsc',
  'name-desc': 'sidebar.sort.nameDesc',
};

function sortPlaces(places: Place[], sort: SortValue): Place[] {
  return [...places].sort((a, b) => {
    const order = a.name.localeCompare(b.name);
    return sort === 'name-desc' ? -order : order;
  });
}

interface PlaceRowProps {
  place: Place;
  treeId: string;
  selected: boolean;
  parentName: string | null;
}

function PlaceRow({ place, treeId, selected, parentName }: PlaceRowProps): JSX.Element {
  return (
    <SidebarRow
      to="/tree/$treeId/place/$placeId"
      params={{ treeId, placeId: place.id }}
      selected={selected}
    >
      <SidebarRow.Name>{place.name}</SidebarRow.Name>
      {parentName !== null && <SidebarRow.Meta>{parentName}</SidebarRow.Meta>}
    </SidebarRow>
  );
}

const PLACES_SKELETON_ROW = (
  <Flex direction="column" gap="1" px="2" py="2">
    <Skeleton width="65%" height="12px" />
    <Skeleton width="45%" height="10px" />
  </Flex>
);

/**
 * The Places section sidebar — the list of every place in the open tree,
 * rendered in the in-tree shell's left column. Header (title, count, a
 * disabled "New" button), the scrollable place list, and a sort footer.
 *
 * Each row shows the place name prominently, with the direct parent name
 * below it when present. Root places (no parent) show only the name.
 *
 * Composed on top of {@link EntityListPanel} + {@link EntityListBody} +
 * {@link SidebarRow}, the shared shell and primitives for every section list.
 */
export function PlacesSidebar(): JSX.Element | null {
  const { t } = useTranslation('places');
  const { t: tCommon } = useTranslation('common');
  const params = useParams({ strict: false });
  const { data, isLoading, isError } = usePlaces();
  const [sort, setSort] = useState<SortValue>('name-asc');

  const nameById = useMemo<Map<string, string>>(() => {
    if (!data) return new Map();
    return new Map(data.map((p) => [p.id, p.name]));
  }, [data]);

  const rows = useMemo(() => (data ? sortPlaces(data, sort) : []), [data, sort]);

  const sortOptions = useMemo(() => buildSortOptions(SORT_VALUES, SORT_LABEL_KEYS, t), [t]);

  const treeId = params.treeId;
  if (treeId === undefined) return null;

  let status: 'loading' | 'error' | 'empty' | 'ready' = 'ready';
  if (isLoading) status = 'loading';
  else if (isError) status = 'error';
  else if (rows.length === 0) status = 'empty';

  return (
    <EntityListPanel
      title={tCommon('nav.places')}
      count={data?.length}
      action={
        <Button size="2" disabled>
          <Icon name="plus" size={16} />
          {t('sidebar.newButton')}
        </Button>
      }
      sort={{
        label: t('sidebar.sortLabel'),
        options: sortOptions,
        value: sort,
        onChange: setSort,
        disabled: rows.length === 0,
      }}
    >
      <EntityListBody
        status={status}
        skeletonRow={PLACES_SKELETON_ROW}
        emptyIcon="map-pin"
        emptyMessage={t('sidebar.empty')}
        errorMessage={tCommon('errors.loadFailed')}
      >
        {rows.map((place) => (
          <PlaceRow
            key={place.id}
            place={place}
            treeId={treeId}
            selected={place.id === params.placeId}
            parentName={place.parentId !== null ? (nameById.get(place.parentId) ?? null) : null}
          />
        ))}
      </EntityListBody>
    </EntityListPanel>
  );
}
