import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import { formatName } from '$db-tree/names';
import { initialsOf } from '$components/person-overview/to-person-ref';
import { Avatar } from '$components/ui/avatar';
import { IconButton } from '$components/ui/icon-button';
import { Tooltip } from '$components/ui/tooltip';
import type { IndividualWithDetails } from '$types/database';
import { SEX_ICON, formatEventDate, lifespanYears } from './person-rail-data';
import * as styles from './person-rail.css';

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

      <div className={styles.collapsedAvatars}>
        {people.map((person) => (
          <Tooltip.Root key={person.id}>
            <Tooltip.Trigger
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
          </Tooltip.Root>
        ))}
      </div>

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
