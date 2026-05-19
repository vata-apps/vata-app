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

function comparePeople(
  a: IndividualWithDetails,
  b: IndividualWithDetails,
  sort: SortValue
): number {
  switch (sort) {
    case 'surname-desc':
      return formatName(b.primaryName).sortable.localeCompare(formatName(a.primaryName).sortable);
    case 'given-asc':
      return (a.primaryName?.givenNames ?? '').localeCompare(b.primaryName?.givenNames ?? '');
    case 'birth-asc':
    case 'birth-desc': {
      const ay = eventYear(a.birthEvent);
      const by = eventYear(b.birthEvent);
      // Individuals with no known birth year sort last in both directions.
      if (ay === by) return 0;
      if (ay === null) return 1;
      if (by === null) return -1;
      return sort === 'birth-asc' ? ay.localeCompare(by) : by.localeCompare(ay);
    }
    case 'surname-asc':
    default:
      return formatName(a.primaryName).sortable.localeCompare(formatName(b.primaryName).sortable);
  }
}

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

  const rows = useMemo(
    () => (data ? [...data].sort((a, b) => comparePeople(a, b, sort)) : []),
    [data, sort]
  );

  const sortOptions: EntityListSortOption[] = [
    { value: 'surname-asc', label: t('sidebar.sort.surnameAsc') },
    { value: 'surname-desc', label: t('sidebar.sort.surnameDesc') },
    { value: 'given-asc', label: t('sidebar.sort.givenAsc') },
    { value: 'birth-asc', label: t('sidebar.sort.birthAsc') },
    { value: 'birth-desc', label: t('sidebar.sort.birthDesc') },
  ];

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
        onChange: (value) => setSort(value as SortValue),
        disabled: rows.length === 0,
      }}
    >
      {body}
    </EntityListPanel>
  );
}
