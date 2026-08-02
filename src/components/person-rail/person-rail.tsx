import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useIndividuals } from '$hooks/useIndividuals';
import { useMediaQuery } from '$hooks/useMediaQuery';
import { useAppStore } from '$/store/app-store';
import { useDebouncedValue } from '$hooks/useDebouncedValue';
import { CollapsedPeopleRail } from './collapsed-people-rail';
import { ExpandedPeopleList } from './expanded-people-list';
import { buildPeopleRailComparator, filterPeopleRail } from './person-rail-data';

interface PersonRailProps {
  treeId: string;
  activeIndividualId?: string;
}

/**
 * The persistent people rail beside a person's detail screen — the mockup's
 * master list. Expanded (280px, search + filters + sort) above 1200px,
 * collapsed to a 60px avatar rail below it; the user's explicit choice (via
 * {@link CollapsedPeopleRail}/{@link ExpandedPeopleList}'s toggle) overrides
 * the responsive default until changed again, and persists across reloads.
 */
export function PersonRail({ treeId, activeIndividualId }: PersonRailProps): JSX.Element | null {
  const { i18n } = useTranslation();
  const { data: allPeople } = useIndividuals();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 200);

  const isNarrow = useMediaQuery('(max-width: 1200px)');
  const collapsedOverride = useAppStore((state) => state.peopleRailCollapsed);
  const setCollapsedOverride = useAppStore((state) => state.setPeopleRailCollapsed);
  const filters = useAppStore((state) => state.peopleRailFilters);
  const setFilters = useAppStore((state) => state.setPeopleRailFilters);
  const sort = useAppStore((state) => state.peopleRailSort);
  const setSort = useAppStore((state) => state.setPeopleRailSort);

  const visiblePeople = useMemo(() => {
    const filtered = filterPeopleRail(allPeople ?? [], filters, debouncedQuery);
    return [...filtered].sort(buildPeopleRailComparator(sort, i18n.language));
  }, [allPeople, filters, debouncedQuery, sort, i18n.language]);

  if (!allPeople) return null;

  const collapsed = collapsedOverride ?? isNarrow;
  const hasFilters = filters.sex.length > 0 || filters.status.length > 0;

  if (collapsed) {
    return (
      <CollapsedPeopleRail
        treeId={treeId}
        people={visiblePeople}
        totalCount={allPeople.length}
        activeIndividualId={activeIndividualId}
        hasFilters={hasFilters}
        onExpand={() => setCollapsedOverride(false)}
      />
    );
  }

  return (
    <ExpandedPeopleList
      treeId={treeId}
      allPeople={allPeople}
      visiblePeople={visiblePeople}
      totalCount={allPeople.length}
      query={query}
      onQueryChange={setQuery}
      filters={filters}
      onFiltersChange={setFilters}
      sort={sort}
      onSortChange={setSort}
      activeIndividualId={activeIndividualId}
      onCollapse={() => setCollapsedOverride(true)}
    />
  );
}
