import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import * as card from '../ui/card.css';
import { Typography } from '../ui/typography';
import * as s from './panel.css';

/** The person tabs an Overview panel can hand off to via its "view all" action. */
type PanelTabRoute =
  | '/tree/$treeId/individual/$individualId/names'
  | '/tree/$treeId/individual/$individualId/events'
  | '/tree/$treeId/individual/$individualId/relations'
  | '/tree/$treeId/individual/$individualId/places';

/**
 * The head strip of a sectioned Overview card: the section title, then whatever
 * the panel puts beside it — a count badge next to the title, a
 * {@link ViewAllLink} or {@link ViewAllUnavailable} pinned to the far edge (the
 * action classes carry their own `margin-left: auto`).
 */
export function PanelHead({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}): JSX.Element {
  return (
    <div className={card.head}>
      <Typography as="h2" size="md" weight="strong">
        {title}
      </Typography>
      {children}
    </div>
  );
}

/** Hands off to the tab that owns the section's records in full. */
export function ViewAllLink({
  to,
  treeId,
  individualId,
}: {
  to: PanelTabRoute;
  treeId: string;
  individualId: string;
}): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Link to={to} params={{ treeId, individualId }} className={s.viewAll}>
      {t('overview.viewAll')}
    </Link>
  );
}

/**
 * The same affordance for a section whose destination isn't built yet (media,
 * the per-person places list). Rendered inert rather than omitted so the head
 * keeps the mockup's shape and only its target has to arrive later.
 */
export function ViewAllUnavailable(): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <span className={s.viewAllDisabled} aria-disabled="true">
      {t('overview.viewAll')}
    </span>
  );
}
