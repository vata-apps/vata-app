import './people-sidebar.css';

import { useMemo, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button, Flex, Skeleton } from '@radix-ui/themes';

import { EntityListPanel } from './entity-list-panel';
import { EntityListBody } from './entity-list-body';
import { SidebarRow } from './sidebar-row';
import { buildSortOptions, initialsOf } from './sort-helpers';
import { Icon } from '$components/icon';
import { useIndividuals } from '$hooks/useIndividuals';
import { formatName } from '$db-tree/names';
import type { IndividualWithDetails } from '$types/database';

const SORT_VALUES = [
  'surname-asc',
  'surname-desc',
  'given-asc',
  'given-desc',
  'birth-asc',
  'birth-desc',
] as const;

type SortValue = (typeof SORT_VALUES)[number];

const SORT_LABEL_KEYS: Record<SortValue, string> = {
  'surname-asc': 'sidebar.sort.surnameAsc',
  'surname-desc': 'sidebar.sort.surnameDesc',
  'given-asc': 'sidebar.sort.givenAsc',
  'given-desc': 'sidebar.sort.givenDesc',
  'birth-asc': 'sidebar.sort.birthAsc',
  'birth-desc': 'sidebar.sort.birthDesc',
};

function eventYear(event: { dateSort: string | null } | null): string | null {
  return event?.dateSort ? event.dateSort.slice(0, 4) : null;
}

function lifespanOf(person: IndividualWithDetails): string {
  const birth = eventYear(person.birthEvent) ?? '?';
  if (person.isLiving) return `${birth} —`;
  return `${birth} — ${eventYear(person.deathEvent) ?? '?'}`;
}

type NameDisplayMode = 'givenFirst' | 'surnameFirst';

function displayModeFor(sort: SortValue): NameDisplayMode {
  return sort === 'given-asc' || sort === 'given-desc' ? 'givenFirst' : 'surnameFirst';
}

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

function compareKeys(a: string | null, b: string | null, sort: SortValue): number {
  if (a === null || b === null) {
    if (a === b) return 0;
    return a === null ? 1 : -1;
  }
  const order = a.localeCompare(b);
  return sort.endsWith('-desc') ? -order : order;
}

function sortPeople(people: IndividualWithDetails[], sort: SortValue): IndividualWithDetails[] {
  return people
    .map((person) => ({ person, key: sortKeyOf(person, sort) }))
    .sort((a, b) => compareKeys(a.key, b.key, sort))
    .map((decorated) => decorated.person);
}

interface PersonRowProps {
  person: IndividualWithDetails;
  treeId: string;
  selected: boolean;
  displayMode: NameDisplayMode;
}

function PersonRow({ person, treeId, selected, displayMode }: PersonRowProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const name = person.primaryName;
  const displayName = ((): string => {
    if (!name) return t('sidebar.unknownName');
    const formatted = formatName(name);
    return displayMode === 'surnameFirst' ? formatted.surnameFirst : formatted.full;
  })();

  return (
    <SidebarRow
      to="/tree/$treeId/individual/$individualId"
      params={{ treeId, individualId: person.id }}
      selected={selected}
      leading={
        <span className="person-row__avatar" aria-hidden="true">
          {initialsOf(name)}
        </span>
      }
    >
      <SidebarRow.Name>{displayName}</SidebarRow.Name>
      <SidebarRow.Meta>{lifespanOf(person)}</SidebarRow.Meta>
    </SidebarRow>
  );
}

const PERSON_SKELETON_ROW = (
  <Flex align="center" gap="3" px="2" py="2">
    <Skeleton width="30px" height="30px" style={{ borderRadius: '9999px' }} />
    <Flex direction="column" gap="1" flexGrow="1">
      <Skeleton width="60%" height="12px" />
      <Skeleton width="35%" height="10px" />
    </Flex>
  </Flex>
);

/**
 * The People section sidebar — the list of every person in the open tree,
 * rendered in the in-tree shell's left column. Header (title, count, a
 * disabled "New" button), the scrollable person list, and a sort footer.
 *
 * Search and filtering are deliberately out of scope for this iteration.
 * Clicking a row opens that individual's detail route; the row matching
 * the open `$individualId` is highlighted.
 *
 * Composed on top of {@link EntityListPanel} + {@link EntityListBody} +
 * {@link SidebarRow}, the shared shell and primitives for every section list.
 */
export function PeopleSidebar(): JSX.Element | null {
  const { t } = useTranslation('individuals');
  const { t: tCommon } = useTranslation('common');
  const params = useParams({ strict: false });
  const { data, isLoading, isError } = useIndividuals();
  const [sort, setSort] = useState<SortValue>('surname-asc');

  const rows = useMemo(() => (data ? sortPeople(data, sort) : []), [data, sort]);
  const displayMode = displayModeFor(sort);

  const sortOptions = useMemo(() => buildSortOptions(SORT_VALUES, SORT_LABEL_KEYS, t), [t]);

  const treeId = params.treeId;
  if (treeId === undefined) return null;

  let status: 'loading' | 'error' | 'empty' | 'ready' = 'ready';
  if (isLoading) status = 'loading';
  else if (isError) status = 'error';
  else if (rows.length === 0) status = 'empty';

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
      <EntityListBody
        status={status}
        skeletonRow={PERSON_SKELETON_ROW}
        emptyIcon="user"
        emptyMessage={t('sidebar.empty')}
        errorMessage={tCommon('errors.loadFailed')}
      >
        {rows.map((person) => (
          <PersonRow
            key={person.id}
            person={person}
            treeId={treeId}
            selected={person.id === params.individualId}
            displayMode={displayMode}
          />
        ))}
      </EntityListBody>
    </EntityListPanel>
  );
}
