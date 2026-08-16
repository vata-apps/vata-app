import { useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { useVirtualizer } from '@tanstack/react-virtual';
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

/** Estimated row height (px) before the virtualizer measures the real one. */
const ROW_HEIGHT_ESTIMATE = 52;

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
 *
 * The row list is virtualized (see issue #267) — only rows near the viewport
 * are mounted, so keyboard `Tab` can reach rows that are on screen or within
 * the overscan, not the whole underlying list. That's the standard tradeoff
 * of windowing (the same one VS Code's and GitHub's own virtualized lists
 * accept) rather than an oversight; the search box above narrows the list to
 * a keyboard-reachable size for anyone hunting a specific person.
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

  const scrollRef = useRef<HTMLDivElement>(null);
  // Windows the row set instead of mounting every person's row (and its
  // router `Link`) at once — see issue #267.
  const virtualizer = useVirtualizer({
    count: visiblePeople.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT_ESTIMATE,
    overscan: 8,
  });

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

      <div ref={scrollRef} className={styles.rows}>
        {visiblePeople.length === 0 ? (
          <div className={styles.emptyRows}>{t('rail.noMatches')}</div>
        ) : (
          <div className={styles.rowsSizer} style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const person = visiblePeople[virtualRow.index];
              return (
                <div
                  key={person.id}
                  ref={virtualizer.measureElement}
                  data-index={virtualRow.index}
                  className={styles.virtualRow}
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <Link
                    to="/tree/$treeId/individual/$individualId"
                    params={{ treeId, individualId: person.id }}
                    className={
                      person.id === activeIndividualId
                        ? `${styles.row} ${styles.rowActive}`
                        : styles.row
                    }
                    aria-current={person.id === activeIndividualId ? 'page' : undefined}
                  >
                    <Avatar.Root
                      size="sm"
                      tone={person.id === activeIndividualId ? 'brand' : 'neutral'}
                    >
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PeopleSortMenu sort={sort} onChange={onSortChange} />
    </aside>
  );
}
