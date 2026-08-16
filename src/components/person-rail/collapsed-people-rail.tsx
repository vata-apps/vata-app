import { useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import { formatName } from '$db-tree/names';
import { Avatar } from '$components/ui/avatar';
import { IconButton } from '$components/ui/icon-button';
import { Tooltip } from '$components/ui/tooltip';
import { initialsOf } from '$lib/personSummary';
import type { IndividualWithDetails } from '$types/database';
import { SEX_ICON, formatEventDate, lifespanYears } from './person-rail-data';
import * as styles from './person-rail.css';

// The size="sm" avatar (24px) plus the column's former vertical gap (8px),
// now baked into each virtualized row itself.
const AVATAR_ROW_HEIGHT = 32;

interface CollapsedPeopleRailProps {
  treeId: string;
  people: IndividualWithDetails[];
  totalCount: number;
  activeIndividualId?: string;
  hasFilters: boolean;
  onExpand: () => void;
}

/**
 * The collapsed people rail — a 60px column of avatars, shown under 1200px
 * (or when the user pins it collapsed). Hovering an avatar opens a preview
 * popover with the person's name, lifespan, and birth/death facts.
 *
 * The avatar column is virtualized (only the avatars near the viewport are
 * mounted) and every avatar shares one detached tooltip via a single handle,
 * rather than each person mounting its own `Tooltip.Root` — see issue #267.
 * As with {@link ExpandedPeopleList}, virtualizing means keyboard `Tab` only
 * reaches the mounted avatars, not the whole underlying list — the standard
 * tradeoff of windowing, not an oversight.
 */
export function CollapsedPeopleRail({
  treeId,
  people,
  totalCount,
  activeIndividualId,
  hasFilters,
  onExpand,
}: CollapsedPeopleRailProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const [avatarTooltip] = useState(() => Tooltip.createHandle<IndividualWithDetails>());

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: people.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => AVATAR_ROW_HEIGHT,
    getItemKey: (index) => people[index].id,
    overscan: 8,
  });

  return (
    <aside aria-label={t('rail.collapsedAriaLabel')} className={styles.collapsedRail}>
      <Tooltip.Root>
        <Tooltip.Trigger
          render={
            <IconButton
              onClick={onExpand}
              aria-label={t('rail.expand')}
              className={styles.collapsedToggle}
            >
              <Icon name="panel-left-open" size={15} />
              {hasFilters && <span className={styles.filterDot} />}
            </IconButton>
          }
        />
        <Tooltip.Portal>
          <Tooltip.Positioner side="right" sideOffset={6}>
            <Tooltip.Popup>{t('rail.expand')}</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>

      <div ref={scrollRef} className={styles.collapsedAvatars}>
        <div className={styles.avatarsSizer} style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const person = people[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                className={styles.avatarRow}
                style={{
                  height: AVATAR_ROW_HEIGHT,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <Tooltip.Trigger
                  handle={avatarTooltip}
                  payload={person}
                  render={
                    <Link
                      to="/tree/$treeId/individual/$individualId"
                      params={{ treeId, individualId: person.id }}
                      className={styles.collapsedAvatarButton}
                      aria-current={person.id === activeIndividualId ? 'page' : undefined}
                    >
                      <Avatar.Root
                        size="sm"
                        tone={person.id === activeIndividualId ? 'brand' : 'neutral'}
                      >
                        <Avatar.Fallback>{initialsOf(person.primaryName)}</Avatar.Fallback>
                      </Avatar.Root>
                    </Link>
                  }
                />
              </div>
            );
          })}
        </div>
      </div>

      <Tooltip.Root handle={avatarTooltip}>
        {({ payload: person }) =>
          person && (
            <Tooltip.Portal>
              <Tooltip.Positioner side="right" align="start" sideOffset={6}>
                <Tooltip.Popup className={styles.hoverPopover}>
                  <div className={styles.hoverHeader}>
                    <Avatar.Root size="md" tone="neutral">
                      <Avatar.Fallback>{initialsOf(person.primaryName)}</Avatar.Fallback>
                    </Avatar.Root>
                    <div>
                      <div>{formatName(person.primaryName).full}</div>
                      <div>{lifespanYears(person)}</div>
                    </div>
                  </div>
                  <div className={styles.hoverDivider} />
                  <div className={styles.hoverRow}>
                    <Icon name={SEX_ICON[person.gender]} size={13} />
                    <span>{t(`table.sex.${person.gender}`)}</span>
                  </div>
                  <div className={styles.hoverRow}>
                    <Icon name="baby" size={13} />
                    <span>{t('rail.hover.born')}</span>
                    <span className={styles.hoverRowValue}>
                      {formatEventDate(person.birthEvent)}
                    </span>
                  </div>
                  {!person.isLiving && (
                    <div className={styles.hoverRow}>
                      <Icon name="cross" size={13} />
                      <span>{t('rail.hover.died')}</span>
                      <span className={styles.hoverRowValue}>
                        {formatEventDate(person.deathEvent)}
                      </span>
                    </div>
                  )}
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          )
        }
      </Tooltip.Root>

      <div
        className={styles.collapsedCount}
        title={t('rail.visibleCount', { count: people.length })}
      >
        {people.length}
        {hasFilters && ` / ${totalCount}`}
      </div>
    </aside>
  );
}
