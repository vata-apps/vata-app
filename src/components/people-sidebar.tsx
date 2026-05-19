import './people-sidebar.css';

import { type ReactNode, useMemo, useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button, Flex, Skeleton, Text } from '@radix-ui/themes';

import { EntityListPanel, type EntityListSortOption } from './entity-list-panel';
import { Icon } from '$components/icon';
import { useIndividuals } from '$hooks/useIndividuals';
import { formatName } from '$db-tree/names';
import type { IndividualWithDetails, Name } from '$/types/database';

/** The sort orders offered by the People sidebar. */
type SortValue = 'surname-asc' | 'surname-desc' | 'given-asc' | 'birth-asc' | 'birth-desc';

/**
 * i18n label key per sort order — the single source the option list is
 * derived from, so the `SortValue` union and the rendered options cannot
 * drift apart.
 */
const SORT_LABEL_KEYS: Record<SortValue, string> = {
  'surname-asc': 'sidebar.sort.surnameAsc',
  'surname-desc': 'sidebar.sort.surnameDesc',
  'given-asc': 'sidebar.sort.givenAsc',
  'birth-asc': 'sidebar.sort.birthAsc',
  'birth-desc': 'sidebar.sort.birthDesc',
};

const SKELETON_ROW_COUNT = 7;

/** Year of an event, read from its normalized `YYYY-MM-DD` sort date. */
function eventYear(event: { dateSort: string | null } | null): string | null {
  return event?.dateSort ? event.dateSort.slice(0, 4) : null;
}

/** Avatar initials — first given-name letter + first surname letter. */
function initialsOf(name: Name | null): string {
  if (!name) return '?';
  const given = name.givenNames?.trim().split(/\s+/)[0]?.charAt(0) ?? '';
  const surname = name.surname?.trim().charAt(0) ?? '';
  const initials = (given + surname).toUpperCase();
  if (initials) return initials;
  const nickname = name.nickname?.trim().charAt(0);
  return nickname ? nickname.toUpperCase() : '?';
}

/** Lifespan string — `1854 — 1921`, `1854 —` when living, `?` per unknown year. */
function lifespanOf(person: IndividualWithDetails): string {
  const birth = eventYear(person.birthEvent) ?? '?';
  if (person.isLiving) return `${birth} —`;
  return `${birth} — ${eventYear(person.deathEvent) ?? '?'}`;
}

/** The comparable key a person sorts on, for the given order. */
function sortKeyOf(person: IndividualWithDetails, sort: SortValue): string | null {
  switch (sort) {
    case 'given-asc':
      return person.primaryName?.givenNames ?? '';
    case 'birth-asc':
    case 'birth-desc':
      return eventYear(person.birthEvent);
    case 'surname-asc':
    case 'surname-desc':
    default:
      return formatName(person.primaryName).sortable;
  }
}

/**
 * Compare two sort keys for the given order. A null key — an unknown
 * birth year — always sorts last, whichever direction is active.
 */
function compareKeys(a: string | null, b: string | null, sort: SortValue): number {
  if (a === null || b === null) {
    if (a === b) return 0;
    return a === null ? 1 : -1;
  }
  const order = a.localeCompare(b);
  return sort === 'surname-desc' || sort === 'birth-desc' ? -order : order;
}

/**
 * Sort people by the given order. Decorate-sort-undecorate: each person's
 * key is computed once up front, so `formatName` runs O(n) times rather
 * than O(n log n) inside the comparator.
 */
function sortPeople(people: IndividualWithDetails[], sort: SortValue): IndividualWithDetails[] {
  return people
    .map((person) => ({ person, key: sortKeyOf(person, sort) }))
    .sort((a, b) => compareKeys(a.key, b.key, sort))
    .map((decorated) => decorated.person);
}

/** Props accepted by {@link PersonRow}. */
interface PersonRowProps {
  person: IndividualWithDetails;
  treeId: string;
  selected: boolean;
}

/** A single navigable person row — avatar, name, lifespan, chevron. */
function PersonRow({ person, treeId, selected }: PersonRowProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const name = person.primaryName;
  const displayName = name ? formatName(name).full : t('sidebar.unknownName');

  return (
    <Link
      to="/tree/$treeId/individual/$individualId"
      params={{ treeId, individualId: person.id }}
      className="person-row"
      aria-current={selected ? 'page' : undefined}
    >
      <span className="person-row__avatar" aria-hidden="true">
        {initialsOf(name)}
      </span>
      <span className="person-row__text">
        <span className="person-row__name">{displayName}</span>
        <span className="person-row__meta">{lifespanOf(person)}</span>
      </span>
      <Icon name="chevron-right" size={14} className="person-row__chev" />
    </Link>
  );
}

/** Placeholder rows shown while the people query is loading. */
function PeopleListSkeleton(): JSX.Element {
  return (
    <Flex direction="column" gap="1" p="2" aria-hidden="true">
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <Flex key={index} align="center" gap="3" px="2" py="2">
          <Skeleton width="30px" height="30px" style={{ borderRadius: '9999px' }} />
          <Flex direction="column" gap="1" flexGrow="1">
            <Skeleton width="60%" height="12px" />
            <Skeleton width="35%" height="10px" />
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
}

/** Centered message for the empty and error states. */
function PeopleListMessage({
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
      {icon && <Icon name="user" size={24} style={{ color: 'var(--gray-8)' }} />}
      <Text size="2" color="gray">
        {children}
      </Text>
    </Flex>
  );
}

/**
 * The People section sidebar — the list of every person in the open tree,
 * rendered in the in-tree shell's left column. Header (title, count, a
 * disabled "New" button), the scrollable person list, and a sort footer.
 *
 * Search and filtering are deliberately out of scope for this iteration.
 * Clicking a row opens that individual's detail route; the row matching
 * the open `$individualId` is highlighted.
 *
 * Composed on top of {@link EntityListPanel}, the entity-agnostic shell
 * shared by every section list.
 */
export function PeopleSidebar(): JSX.Element | null {
  const { t } = useTranslation('individuals');
  const { t: tCommon } = useTranslation('common');
  const params = useParams({ strict: false });
  const { data, isLoading, isError } = useIndividuals();
  const [sort, setSort] = useState<SortValue>('surname-asc');

  const rows = useMemo(() => (data ? sortPeople(data, sort) : []), [data, sort]);

  const sortOptions = useMemo<EntityListSortOption<SortValue>[]>(
    () =>
      (Object.keys(SORT_LABEL_KEYS) as SortValue[]).map((value) => ({
        value,
        label: t(SORT_LABEL_KEYS[value]),
      })),
    [t]
  );

  const treeId = params.treeId;
  if (treeId === undefined) return null;

  let body: ReactNode;
  if (isLoading) {
    body = <PeopleListSkeleton />;
  } else if (isError) {
    body = <PeopleListMessage>{tCommon('errors.loadFailed')}</PeopleListMessage>;
  } else if (rows.length === 0) {
    body = <PeopleListMessage icon>{t('sidebar.empty')}</PeopleListMessage>;
  } else {
    body = (
      <Flex direction="column" gap="1" p="2">
        {rows.map((person) => (
          <PersonRow
            key={person.id}
            person={person}
            treeId={treeId}
            selected={person.id === params.individualId}
          />
        ))}
      </Flex>
    );
  }

  return (
    <EntityListPanel
      title={tCommon('nav.individuals')}
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
