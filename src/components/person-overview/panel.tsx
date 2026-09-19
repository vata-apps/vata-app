import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import * as s from './panel.css';

/** The person tabs an Overview panel can hand off to via its "view all" action. */
type PanelTabRoute =
  | '/tree/$treeId/individuals/$individualId/names'
  | '/tree/$treeId/individuals/$individualId/events'
  | '/tree/$treeId/individuals/$individualId/relations'
  | '/tree/$treeId/individuals/$individualId/places';

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
