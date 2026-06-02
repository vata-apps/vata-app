import { type ReactNode, useMemo, useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Card, Flex, Skeleton, Text } from '@radix-ui/themes';

import { EntityListPanel, type EntityListSortOption } from './entity-list-panel';
import { Icon } from '$components/icon';
import { useIndividuals } from '$hooks/useIndividuals';
import { formatName } from '$db-tree/names';
import type { IndividualWithDetails, Name } from '$types/database';

/** The sort orders offered by the People sidebar, in display order. */
const SORT_VALUES = [
  'surname-asc',
  'surname-desc',
  'given-asc',
  'given-desc',
  'birth-asc',
  'birth-desc',
] as const;

type SortValue = (typeof SORT_VALUES)[number];

/** i18n label key per sort order — one entry is required for every SortValue. */
const SORT_LABEL_KEYS: Record<SortValue, string> = {
  'surname-asc': 'sidebar.sort.surnameAsc',
  'surname-desc': 'sidebar.sort.surnameDesc',
  'given-asc': 'sidebar.sort.givenAsc',
  'given-desc': 'sidebar.sort.givenDesc',
  'birth-asc': 'sidebar.sort.birthAsc',
  'birth-desc': 'sidebar.sort.birthDesc',
};

const SKELETON_ROW_COUNT = 7;

/**
 * Year of an event, read from the first four characters of its
 * normalized `YYYY-MM-DD` sort date. Null when the event or its sort
 * date is missing.
 */
function eventYear(event: { dateSort: string | null } | null): string | null {
  return event?.dateSort ? event.dateSort.slice(0, 4) : null;
}

/**
 * Avatar initials for a name — the first given-name letter and the first
 * surname letter, uppercased. Falls back to the nickname's first letter,
 * then to `?` when the name carries no usable text.
 */
function initialsOf(name: Name | null): string {
  if (!name) return '?';
  const given = name.givenNames?.trim().split(/\s+/)[0]?.charAt(0) ?? '';
  const surname = name.surname?.trim().charAt(0) ?? '';
  const initials = (given + surname).toUpperCase();
  if (initials) return initials;
  const nickname = name.nickname?.trim().charAt(0);
  return nickname ? nickname.toUpperCase() : '?';
}

/**
 * The lifespan line for a person — `1854 — 1921`, or `1854 —` when the
 * person is living. An unknown birth or death year shows as `?`.
 */
function lifespanOf(person: IndividualWithDetails): string {
  const birth = eventYear(person.birthEvent) ?? '?';
  if (person.isLiving) return `${birth} —`;
  return `${birth} — ${eventYear(person.deathEvent) ?? '?'}`;
}

/**
 * Which name representation a row renders. Mirrors the user-visible
 * sort order: a given-name sort is the only case where the row leads
 * with the given names; every other sort (surname asc/desc, birth
 * asc/desc) leads with the surname so the user can scan the column
 * by the value being sorted on.
 */
type NameDisplayMode = 'givenFirst' | 'surnameFirst';

/** The display mode that matches the given sort order. */
function displayModeFor(sort: SortValue): NameDisplayMode {
  return sort === 'given-asc' || sort === 'given-desc' ? 'givenFirst' : 'surnameFirst';
}

/**
 * The comparable key a person sorts on for the given order: the sortable
 * name for surname sorts, the given names for the given-name sort, and
 * the birth year (nullable) for birth sorts.
 */
function sortKeyOf(person: IndividualWithDetails, sort: SortValue): string | null {
  switch (sort) {
    case 'given-asc':
    case 'given-desc':
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
  return sort.endsWith('-desc') ? -order : order;
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
  displayMode: NameDisplayMode;
}

/** A single navigable person row — avatar, name, lifespan, chevron. */
function PersonRow({ person, treeId, selected, displayMode }: PersonRowProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const name = person.primaryName;
  const displayName = ((): string => {
    if (!name) return t('sidebar.unknownName');
    const formatted = formatName(name);
    return displayMode === 'surnameFirst' ? formatted.surnameFirst : formatted.full;
  })();

  return (
    <Card asChild size="1" variant={selected ? 'surface' : 'ghost'}>
      <Link
        to="/tree/$treeId/individual/$individualId"
        params={{ treeId, individualId: person.id }}
        aria-current={selected ? 'page' : undefined}
      >
        <Flex align="center" gap="2">
          <Avatar
            size="1"
            radius="full"
            variant="soft"
            color={selected ? 'indigo' : 'gray'}
            fallback={initialsOf(name)}
          />
          <Flex direction="column" flexGrow="1" minWidth="0">
            <Text size="2" weight="medium" truncate>
              {displayName}
            </Text>
            <Text size="1" color="gray" truncate>
              {lifespanOf(person)}
            </Text>
          </Flex>
          <Icon name="chevron-right" size={14} />
        </Flex>
      </Link>
    </Card>
  );
}

/** Placeholder rows shown while the people query is loading. */
function PeopleListSkeleton(): JSX.Element {
  return (
    <Flex direction="column" gap="1" p="2" aria-hidden="true">
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <Flex key={index} align="center" gap="3" px="2" py="2">
          <Skeleton>
            <Avatar size="1" radius="full" fallback="" />
          </Skeleton>
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
    <Flex direction="column" align="center" justify="center" gap="2" px="5" py="8">
      {icon && (
        <Text color="gray" asChild>
          <Icon name="user" size={24} />
        </Text>
      )}
      <Text size="2" color="gray" align="center">
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
  const displayMode = displayModeFor(sort);

  const sortOptions = useMemo<EntityListSortOption<SortValue>[]>(
    () => SORT_VALUES.map((value) => ({ value, label: t(SORT_LABEL_KEYS[value]) })),
    [t]
  );

  const treeId = params.treeId;
  if (treeId === undefined) return null;

  const body: ReactNode = ((): ReactNode => {
    if (isLoading) return <PeopleListSkeleton />;
    if (isError) return <PeopleListMessage>{tCommon('errors.loadFailed')}</PeopleListMessage>;
    if (rows.length === 0) return <PeopleListMessage icon>{t('sidebar.empty')}</PeopleListMessage>;
    return (
      <Flex direction="column" gap="1" p="2">
        {rows.map((person) => (
          <PersonRow
            key={person.id}
            person={person}
            treeId={treeId}
            selected={person.id === params.individualId}
            displayMode={displayMode}
          />
        ))}
      </Flex>
    );
  })();

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
