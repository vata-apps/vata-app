import './places-sidebar.css';

import { type ReactNode, useMemo, useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button, Flex, Skeleton, Text } from '@radix-ui/themes';

import { EntityListPanel, type EntityListSortOption } from './entity-list-panel';
import { Icon } from '$components/icon';
import { usePlaces } from '$hooks/usePlaces';
import type { Place } from '$types/database';

const SORT_VALUES = ['name-asc', 'name-desc'] as const;
type SortValue = (typeof SORT_VALUES)[number];

const SORT_LABEL_KEYS: Record<SortValue, string> = {
  'name-asc': 'sidebar.sort.nameAsc',
  'name-desc': 'sidebar.sort.nameDesc',
};

const SKELETON_ROW_COUNT = 7;

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
    <Link
      to="/tree/$treeId/place/$placeId"
      params={{ treeId, placeId: place.id }}
      className="place-row"
      aria-current={selected ? 'page' : undefined}
    >
      <span className="place-row__text">
        <span className="place-row__name">{place.name}</span>
        {parentName !== null && <span className="place-row__meta">{parentName}</span>}
      </span>
      <Icon name="chevron-right" size={14} className="place-row__chev" />
    </Link>
  );
}

function PlacesListSkeleton(): JSX.Element {
  return (
    <Flex direction="column" gap="1" p="2" aria-hidden="true">
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <Flex key={index} direction="column" gap="1" px="2" py="2">
          <Skeleton width="65%" height="12px" />
          <Skeleton width="45%" height="10px" />
        </Flex>
      ))}
    </Flex>
  );
}

function PlacesListMessage({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: boolean;
}): JSX.Element {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="2"
      px="5"
      py="8"
      style={{ textAlign: 'center' }}
    >
      {icon && <Icon name="map-pin" size={24} style={{ color: 'var(--gray-8)' }} />}
      <Text size="2" color="gray">
        {children}
      </Text>
    </Flex>
  );
}

/**
 * The Places section sidebar — the list of every place in the open tree,
 * rendered in the in-tree shell's left column. Header (title, count, a
 * disabled "New" button), the scrollable place list, and a sort footer.
 *
 * Each row shows the place name prominently, with the direct parent name
 * below it when present. Root places (no parent) show only the name.
 *
 * Composed on top of {@link EntityListPanel}, the same reusable shell
 * used by the People, Families, and Events sidebars.
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

  const sortOptions = useMemo<EntityListSortOption<SortValue>[]>(
    () => SORT_VALUES.map((value) => ({ value, label: t(SORT_LABEL_KEYS[value]) })),
    [t]
  );

  const treeId = params.treeId;
  if (treeId === undefined) return null;

  const body: ReactNode = ((): ReactNode => {
    if (isLoading) return <PlacesListSkeleton />;
    if (isError) return <PlacesListMessage>{tCommon('errors.loadFailed')}</PlacesListMessage>;
    if (rows.length === 0) return <PlacesListMessage icon>{t('sidebar.empty')}</PlacesListMessage>;
    return (
      <Flex direction="column" gap="1" p="2">
        {rows.map((place) => (
          <PlaceRow
            key={place.id}
            place={place}
            treeId={treeId}
            selected={place.id === params.placeId}
            parentName={place.parentId !== null ? (nameById.get(place.parentId) ?? null) : null}
          />
        ))}
      </Flex>
    );
  })();

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
      {body}
    </EntityListPanel>
  );
}
