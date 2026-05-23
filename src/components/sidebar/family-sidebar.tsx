import './family-sidebar.css';

import { useMemo, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button, Flex, Skeleton } from '@radix-ui/themes';

import { EntityListPanel } from './entity-list-panel';
import { EntityListBody } from './entity-list-body';
import { SidebarRow } from './sidebar-row';
import { buildSortOptions, initialsOf } from './sort-helpers';
import { Icon } from '$components/icon';
import { useFamilies } from '$hooks/useFamilies';
import { formatName } from '$db-tree/names';
import type { FamilyWithMembers } from '$types/database';

const SORT_VALUES = [
  'husband-surname-asc',
  'husband-surname-desc',
  'wife-surname-asc',
  'wife-surname-desc',
  'children-desc',
  'children-asc',
] as const;

type SortValue = (typeof SORT_VALUES)[number];

const SORT_LABEL_KEYS: Record<SortValue, string> = {
  'husband-surname-asc': 'sidebar.sort.husbandSurnameAsc',
  'husband-surname-desc': 'sidebar.sort.husbandSurnameDesc',
  'wife-surname-asc': 'sidebar.sort.wifeSurnameAsc',
  'wife-surname-desc': 'sidebar.sort.wifeSurnameDesc',
  'children-desc': 'sidebar.sort.childrenDesc',
  'children-asc': 'sidebar.sort.childrenAsc',
};

function sortFamilies(families: FamilyWithMembers[], sort: SortValue): FamilyWithMembers[] {
  type Decorated = { family: FamilyWithMembers; key: string | null; count: number };

  const decorated: Decorated[] = families.map((family) => {
    let key: string | null;
    if (sort === 'husband-surname-asc' || sort === 'husband-surname-desc') {
      key = family.husband ? formatName(family.husband.primaryName).sortable || null : null;
    } else if (sort === 'wife-surname-asc' || sort === 'wife-surname-desc') {
      key = family.wife ? formatName(family.wife.primaryName).sortable || null : null;
    } else {
      if (family.husband) {
        key = formatName(family.husband.primaryName).sortable || null;
      } else if (family.wife) {
        key = formatName(family.wife.primaryName).sortable || null;
      } else {
        key = null;
      }
    }
    return { family, key, count: family.children.length };
  });

  decorated.sort((a, b) => {
    if (sort === 'children-desc' || sort === 'children-asc') {
      const diff = a.count - b.count;
      if (diff !== 0) return sort === 'children-desc' ? -diff : diff;
      if (a.key === null && b.key === null) return 0;
      if (a.key === null) return 1;
      if (b.key === null) return -1;
      return a.key.localeCompare(b.key);
    }
    if (a.key === null && b.key === null) return 0;
    if (a.key === null) return 1;
    if (b.key === null) return -1;
    const order = a.key.localeCompare(b.key);
    return sort === 'husband-surname-desc' || sort === 'wife-surname-desc' ? -order : order;
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
    <SidebarRow
      to="/tree/$treeId/family/$familyId"
      params={{ treeId, familyId: family.id }}
      selected={selected}
      leading={
        <span className="family-row__couple-avatar" aria-hidden="true">
          <span className={`family-row__spouse-circle${husbandIsUnknown ? ' is-unknown' : ''}`}>
            {initialsOf(husbandName)}
          </span>
          <span className={`family-row__spouse-circle${wifeIsUnknown ? ' is-unknown' : ''}`}>
            {initialsOf(wifeName)}
          </span>
        </span>
      }
    >
      <SidebarRow.Name unknown={husbandIsUnknown}>{husbandDisplay}</SidebarRow.Name>
      <SidebarRow.Name unknown={wifeIsUnknown}>{wifeDisplay}</SidebarRow.Name>
      <SidebarRow.Meta>
        {t('sidebar.childrenCount', { count: family.children.length })}
      </SidebarRow.Meta>
    </SidebarRow>
  );
}

const FAMILY_SKELETON_ROW = (
  <Flex align="center" gap="3" px="2" py="2">
    <Skeleton width="42px" height="30px" style={{ borderRadius: '4px' }} />
    <Flex direction="column" gap="1" flexGrow="1">
      <Skeleton width="60%" height="12px" />
      <Skeleton width="50%" height="12px" />
      <Skeleton width="30%" height="10px" />
    </Flex>
  </Flex>
);

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
 * Composed on top of {@link EntityListPanel} + {@link EntityListBody} +
 * {@link SidebarRow}, the shared shell and primitives for every section list.
 */
export function FamilySidebar(): JSX.Element | null {
  const { t } = useTranslation('families');
  const { t: tCommon } = useTranslation('common');
  const params = useParams({ strict: false });
  const { data, isLoading, isError } = useFamilies();
  const [sort, setSort] = useState<SortValue>('husband-surname-asc');

  const rows = useMemo(() => (data ? sortFamilies(data, sort) : []), [data, sort]);

  const sortOptions = useMemo(() => buildSortOptions(SORT_VALUES, SORT_LABEL_KEYS, t), [t]);

  const treeId = params.treeId;
  if (treeId === undefined) return null;

  let status: 'loading' | 'error' | 'empty' | 'ready' = 'ready';
  if (isLoading) status = 'loading';
  else if (isError) status = 'error';
  else if (rows.length === 0) status = 'empty';

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
      <EntityListBody
        status={status}
        skeletonRow={FAMILY_SKELETON_ROW}
        emptyIcon="users"
        emptyMessage={t('sidebar.empty')}
        errorMessage={tCommon('errors.loadFailed')}
      >
        {rows.map((family) => (
          <FamilyRow
            key={family.id}
            family={family}
            treeId={treeId}
            selected={family.id === params.familyId}
          />
        ))}
      </EntityListBody>
    </EntityListPanel>
  );
}
