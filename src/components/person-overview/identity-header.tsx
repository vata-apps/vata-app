import { Link, useMatchRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import type { Gender } from '$types/database';
import { vars } from '$/design/theme.css';
import { Icon, type IconName } from '../icon';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { IconButton } from '../ui/icon-button';
import { Typography } from '../ui/typography';
import * as s from './identity-header.css';
import type { OverviewPerson } from './overview-types';

/** Maps a recorded sex to its summary icon, with a neutral fallback. */
const SEX_ICON: Record<Gender, IconName> = { M: 'mars', F: 'venus', U: 'user' };

/**
 * The identity band — a monogram avatar, the person's name, and an icon-led
 * summary line: `[sex] · [birth] <date>, <place> · [death] <date>, <place>`.
 * Dates may be imprecise. Built on `Avatar`/`Typography`/`Icon`; the monogram
 * uses `Avatar`'s fallback. The section tabs are a separate {@link
 * OverviewTabs}.
 */
/** Join a (possibly partial) date and place into one label, or `null` when neither is recorded. */
function vitalLabel(date: string, place: string): string | null {
  return [date, place].filter(Boolean).join(', ') || null;
}

interface MetaSegmentData {
  key: string;
  icon?: IconName;
  label?: string;
  text?: string;
}

/** One item in the identity metadata strip: the ID, the sex glyph, or a vital. */
function MetaSegment({ segment }: { segment: MetaSegmentData }): JSX.Element | null {
  const { t } = useTranslation('individuals');

  if (segment.text) {
    return (
      <Typography family="mono" tone="faint">
        {segment.text}
      </Typography>
    );
  }
  if (segment.icon && segment.label) {
    return (
      <div className={s.metaSegment}>
        {/* Icon sits next to text that carries the meaning → decorative. */}
        <Icon name={segment.icon} size={14} color={vars.color.muted} />
        <Typography tone="muted">{segment.label}</Typography>
      </div>
    );
  }
  if (segment.icon) {
    return (
      // Standalone icon (sex) → make it announce.
      <Icon
        name={segment.icon}
        size={14}
        color={vars.color.muted}
        aria-hidden={false}
        aria-label={t(`overview.vital.${segment.key}`)}
      />
    );
  }
  return null;
}

export function IdentityHeader({
  person,
  onEdit,
}: {
  person: OverviewPerson;
  onEdit: () => void;
}): JSX.Element {
  const { t } = useTranslation('individuals');

  const bornLabel = vitalLabel(person.birthDate, person.birthPlace);
  const diedLabel = vitalLabel(person.deathDate, person.deathPlace);

  // The sex glyph is always shown; the born/died segments only appear when the
  // event is recorded, so people without a death event don't show a stray icon.
  const segments: MetaSegmentData[] = [
    { key: 'sex', icon: SEX_ICON[person.sex] },
    ...(person.id ? [{ key: 'id', text: person.id }] : []),
    ...(bornLabel ? [{ key: 'born', icon: 'baby' as IconName, label: bornLabel }] : []),
    ...(diedLabel ? [{ key: 'died', icon: 'cross' as IconName, label: diedLabel }] : []),
  ];

  return (
    <div className={s.header}>
      <div className={s.identity}>
        <Avatar.Root size="lg">
          <Avatar.Image src={person.imageUrl} alt="" />
          <Avatar.Fallback>{person.initials}</Avatar.Fallback>
        </Avatar.Root>

        <div className={s.meta}>
          <div className={s.nameRow}>
            <Typography as="h1" size="16" weight="650">
              {person.name}
            </Typography>
            {person.otherNamesCount > 0 && (
              <Badge>{t('overview.lifespan.otherNames', { count: person.otherNamesCount })}</Badge>
            )}
          </div>
          <div className={s.metaRow}>
            {segments.map((segment, i) => (
              <div key={segment.key} className={s.metaSegment}>
                {i > 0 && (
                  <Typography size="12.5" tone="faint">
                    ·
                  </Typography>
                )}
                <MetaSegment segment={segment} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <IconButton aria-label={t('personEditor.editButtonAria')} onClick={onEdit}>
        <Icon name="pencil" />
      </IconButton>
    </div>
  );
}

/**
 * The section tabs, in display order. Every tab is routed — some to real
 * content, some to a stub page (e.g. `PersonSourcesPage`) for a feature not
 * yet built. The `ancestors` id renders the "Pedigree" / "Ascendance" label
 * (see `overview.tabs.ancestors`) — named `ancestors` in code so the word
 * "Pedigree" stays reserved for the parent–child link type; see `CONTEXT.md`.
 */
const OVERVIEW_TABS = [
  { id: 'overview', to: '/tree/$treeId/individual/$individualId' },
  { id: 'ancestors', to: '/tree/$treeId/individual/$individualId/ancestors' },
  { id: 'events', to: '/tree/$treeId/individual/$individualId/events' },
  { id: 'relations', to: '/tree/$treeId/individual/$individualId/relations' },
  { id: 'sources', to: '/tree/$treeId/individual/$individualId/sources' },
  { id: 'notes', to: '/tree/$treeId/individual/$individualId/notes' },
] as const;

/**
 * The section tab bar — a plain semantic nav, not a Base UI `Tabs` component:
 * every tab is a real route (not a same-DOM tab panel), and the router
 * resolves each one's active state independently, so adding another tab
 * never mis-marks a sibling.
 */
export function OverviewTabs({
  treeId,
  individualId,
}: {
  treeId: string;
  individualId: string;
}): JSX.Element {
  const { t } = useTranslation('individuals');
  const matchRoute = useMatchRoute();

  return (
    <nav className={s.tabs}>
      {OVERVIEW_TABS.map((tab) => {
        const label = t(`overview.tabs.${tab.id}`);
        // `fuzzy: false` → exact match, so the Overview (index) tab is not
        // marked active on a nested tab like `/events`.
        const active = Boolean(
          matchRoute({ to: tab.to, params: { treeId, individualId }, fuzzy: false })
        );
        return (
          <Link
            key={tab.id}
            to={tab.to}
            params={{ treeId, individualId }}
            className={active ? `${s.tab} ${s.tabActive}` : s.tab}
            aria-current={active ? 'page' : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
