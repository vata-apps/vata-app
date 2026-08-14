import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import { Avatar } from '$components/ui/avatar';
import { Badge } from '$components/ui/badge';
import { IconButton } from '$components/ui/icon-button';
import { SearchInput } from '$components/ui/search-input';
import { initialsOf } from '$lib/personSummary';
import type { PeopleRailFilters, PeopleRailSort } from '$/store/app-store';
import type { IndividualWithDetails } from '$types/database';
import { SEX_ICON, lifespanYears, rowDisplayName } from './person-rail-data';
import { PeopleFilterPanel } from './people-filter-panel';
import { PeopleSortMenu } from './people-sort-menu';
import * as styles from './person-rail.css';

interface ExpandedPeopleListProps {
  treeId: string;
  allPeople: IndividualWithDetails[];
  visiblePeople: IndividualWithDetails[];
  totalCount: number;
  query: string;
  onQueryChange: (query: string) => void;
  filters: PeopleRailFilters;
  onFiltersChange: (filters: PeopleRailFilters) => void;
  sort: PeopleRailSort;
  onSortChange: (sort: PeopleRailSort) => void;
  activeIndividualId?: string;
  onCollapse: () => void;
}

/**
 * The expanded people rail (280px): search, filter panel, the scrollable
 * row list, and the sort footer. Shown when the rail isn't collapsed — see
 * {@link CollapsedPeopleRail} for the narrow alternative.
 */
export function ExpandedPeopleList({
  treeId,
  allPeople,
  visiblePeople,
  totalCount,
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  activeIndividualId,
  onCollapse,
}: ExpandedPeopleListProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const { t: tCommon } = useTranslation('common');
  const isFiltered = visiblePeople.length !== totalCount;

  return (
    <aside aria-label={t('rail.expandedAriaLabel')} className={styles.expandedRail}>
      <div className={styles.expandedHeader}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{tCommon('nav.individuals')}</span>
          <Badge>{visiblePeople.length}</Badge>
          {isFiltered && (
            <span className={styles.titleTotal}>{t('rail.ofTotal', { count: totalCount })}</span>
          )}
          <IconButton
            onClick={onCollapse}
            aria-label={t('rail.collapse')}
            className={styles.collapseTrigger}
          >
            <Icon name="panel-left-close" size={14} />
          </IconButton>
        </div>

        <SearchInput
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onClear={() => onQueryChange('')}
          placeholder={t('rail.searchPlaceholder')}
          clearLabel={tCommon('filters.clearSearch')}
          aria-label={t('rail.searchPlaceholder')}
        />

        <PeopleFilterPanel people={allPeople} filters={filters} onApply={onFiltersChange} />
      </div>

      <div className={styles.rows}>
        {visiblePeople.map((person) => (
          <Link
            key={person.id}
            to="/tree/$treeId/individual/$individualId"
            params={{ treeId, individualId: person.id }}
            className={
              person.id === activeIndividualId ? `${styles.row} ${styles.rowActive}` : styles.row
            }
            aria-current={person.id === activeIndividualId ? 'page' : undefined}
          >
            <Avatar.Root size="sm" tone={person.id === activeIndividualId ? 'brand' : 'neutral'}>
              <Avatar.Fallback>{initialsOf(person.primaryName)}</Avatar.Fallback>
            </Avatar.Root>
            <div className={styles.rowText}>
              <div className={styles.rowName}>{rowDisplayName(person, sort.field)}</div>
              <div className={styles.rowMeta}>
                <Icon name={SEX_ICON[person.gender]} size={11} />
                <span>{lifespanYears(person)}</span>
              </div>
            </div>
          </Link>
        ))}
        {visiblePeople.length === 0 && (
          <div className={styles.emptyRows}>{t('rail.noMatches')}</div>
        )}
      </div>

      <PeopleSortMenu sort={sort} onChange={onSortChange} />
    </aside>
  );
}
