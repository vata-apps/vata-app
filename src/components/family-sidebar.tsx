import './family-sidebar.css';

import { type ReactNode, useMemo, useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button, Flex, Skeleton, Text } from '@radix-ui/themes';

import { EntityListPanel, type EntityListSortOption } from './entity-list-panel';
import { Icon } from '$components/icon';
import { useFamilies } from '$hooks/useFamilies';
import { formatName } from '$db-tree/names';
import type { FamilyWithMembers, Name } from '$types/database';

const SORT_VALUES = ['surname-asc', 'surname-desc', 'children-desc', 'children-asc'] as const;

type SortValue = (typeof SORT_VALUES)[number];

const SORT_LABEL_KEYS: Record<SortValue, string> = {
  'surname-asc': 'sidebar.sort.surnameAsc',
  'surname-desc': 'sidebar.sort.surnameDesc',
  'children-desc': 'sidebar.sort.childrenDesc',
  'children-asc': 'sidebar.sort.childrenAsc',
};

const SKELETON_ROW_COUNT = 7;

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
 * The sort key for surname-based ordering. Uses the husband's primary
 * surname, falling back to the wife's when no husband is recorded, and
 * to `null` when neither spouse is recorded. A `null` key always sinks
 * to the bottom, regardless of asc/desc direction.
 */
function spouseSortKey(family: FamilyWithMembers): string | null {
  if (family.husband !== null) {
    return formatName(family.husband.primaryName).sortable || null;
  }
  if (family.wife !== null) {
    return formatName(family.wife.primaryName).sortable || null;
  }
  return null;
}

function sortFamilies(families: FamilyWithMembers[], sort: SortValue): FamilyWithMembers[] {
  type Decorated = { family: FamilyWithMembers; key: string | null; count: number };

  const decorated: Decorated[] = families.map((family) => ({
    family,
    key: spouseSortKey(family),
    count: family.children.length,
  }));

  decorated.sort((a, b) => {
    if (sort === 'children-desc' || sort === 'children-asc') {
      const diff = a.count - b.count;
      if (diff !== 0) return sort === 'children-desc' ? -diff : diff;
      // Tie-break alphabetically by surname key.
      if (a.key === null && b.key === null) return 0;
      if (a.key === null) return 1;
      if (b.key === null) return -1;
      return a.key.localeCompare(b.key);
    }
    // Surname sort — null keys always sink to bottom.
    if (a.key === null && b.key === null) return 0;
    if (a.key === null) return 1;
    if (b.key === null) return -1;
    const order = a.key.localeCompare(b.key);
    return sort === 'surname-desc' ? -order : order;
  });

  return decorated.map((d) => d.family);
}

interface FamilyRowProps {
  family: FamilyWithMembers;
  treeId: string;
  selected: boolean;
}

function FamilyRow({ family, treeId, selected }: FamilyRowProps): JSX.Element {
  const { t } = useTranslation('families');

  const husbandName = family.husband?.primaryName ?? null;
  const wifeName = family.wife?.primaryName ?? null;

  const husbandIsUnknown = !family.husband || !husbandName;
  const wifeIsUnknown = !family.wife || !wifeName;

  const husbandDisplay = husbandIsUnknown
    ? t('sidebar.unknownSpouse')
    : formatName(husbandName).surnameFirst;
  const wifeDisplay = wifeIsUnknown
    ? t('sidebar.unknownSpouse')
    : formatName(wifeName).surnameFirst;

  return (
    <Link
      to="/tree/$treeId/family/$familyId"
      params={{ treeId, familyId: family.id }}
      className="family-row"
      aria-current={selected ? 'page' : undefined}
    >
      <span className="family-row__couple-avatar" aria-hidden="true">
        <span className={`family-row__spouse-circle${husbandIsUnknown ? ' is-unknown' : ''}`}>
          {initialsOf(husbandName)}
        </span>
        <span className={`family-row__spouse-circle${wifeIsUnknown ? ' is-unknown' : ''}`}>
          {initialsOf(wifeName)}
        </span>
      </span>
      <span className="family-row__text">
        <span className={`family-row__spouse-name${husbandIsUnknown ? ' is-unknown' : ''}`}>
          {husbandDisplay}
        </span>
        <span className={`family-row__spouse-name${wifeIsUnknown ? ' is-unknown' : ''}`}>
          {wifeDisplay}
        </span>
        <span className="family-row__meta">
          {t('sidebar.childrenCount', { count: family.children.length })}
        </span>
      </span>
      <Icon name="chevron-right" size={14} className="family-row__chev" />
    </Link>
  );
}

function FamilyListSkeleton(): JSX.Element {
  return (
    <Flex direction="column" gap="1" p="2" aria-hidden="true">
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <Flex key={index} align="center" gap="3" px="2" py="2">
          <Skeleton width="42px" height="30px" style={{ borderRadius: '4px' }} />
          <Flex direction="column" gap="1" flexGrow="1">
            <Skeleton width="60%" height="12px" />
            <Skeleton width="50%" height="12px" />
            <Skeleton width="30%" height="10px" />
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
}

function FamilyListMessage({
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
      {icon && <Icon name="users" size={24} style={{ color: 'var(--gray-8)' }} />}
      <Text size="2" color="gray">
        {children}
      </Text>
    </Flex>
  );
}

/**
 * The Families section sidebar — the list of every family in the open
 * tree, rendered in the in-tree shell's left column. Header (title,
 * count, a disabled "New" button), the scrollable family list, and a
 * sort footer.
 *
 * Each row shows the union as a couple: two dashed-circle avatars with
 * spouse initials, the husband's name on the top line, the wife's name
 * on the bottom line, and a children count. A missing spouse renders as
 * italic "Unknown" with a `?` avatar.
 *
 * Clicking a row opens that family's detail route; the row matching the
 * open `$familyId` is highlighted. Composed on top of
 * {@link EntityListPanel}, the entity-agnostic shell shared by every
 * section list.
 */
export function FamilySidebar(): JSX.Element | null {
  const { t } = useTranslation('families');
  const { t: tCommon } = useTranslation('common');
  const params = useParams({ strict: false });
  const { data, isLoading, isError } = useFamilies();
  const [sort, setSort] = useState<SortValue>('surname-asc');

  const rows = useMemo(() => (data ? sortFamilies(data, sort) : []), [data, sort]);

  const sortOptions = useMemo<EntityListSortOption<SortValue>[]>(
    () => SORT_VALUES.map((value) => ({ value, label: t(SORT_LABEL_KEYS[value]) })),
    [t]
  );

  const treeId = params.treeId;
  if (treeId === undefined) return null;

  const body: ReactNode = ((): ReactNode => {
    if (isLoading) return <FamilyListSkeleton />;
    if (isError) return <FamilyListMessage>{tCommon('errors.loadFailed')}</FamilyListMessage>;
    if (rows.length === 0) return <FamilyListMessage icon>{t('sidebar.empty')}</FamilyListMessage>;
    return (
      <Flex direction="column" gap="1" p="2">
        {rows.map((family) => (
          <FamilyRow
            key={family.id}
            family={family}
            treeId={treeId}
            selected={family.id === params.familyId}
          />
        ))}
      </Flex>
    );
  })();

  return (
    <EntityListPanel
      title={tCommon('nav.families')}
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
