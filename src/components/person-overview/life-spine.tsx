import { useTranslation } from 'react-i18next';

import { vars } from '$/design/theme.css';
import { formatLifeYears } from '$lib/personSummary';
import { Icon, type IconName } from '../icon';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import * as card from '../ui/card.css';
import { DataChip } from '../ui/data-chip';
import { Typography } from '../ui/typography';
import { IndividualLink } from './entity-links';
import * as s from './life-spine.css';
import type { OverviewMilestone, PersonRefData } from './overview-types';
import { PanelHead, ViewAllLink } from './panel';
import { PersonRef } from './person-ref';

/** The glyph in each milestone's puck, one per kind of vital event. */
const KIND_ICON: Record<OverviewMilestone['kind'], IconName> = {
  born: 'baby',
  marriage: 'users',
  death: 'cross',
};

/**
 * The life events — a person's key vital events (birth, marriages, death) in
 * one card, each an edge-to-edge row led by a puck for its kind and its
 * (possibly imprecise) date in a `DataChip`.
 *
 * Born and death slots are always rendered — a blank state row appears when
 * the event is not yet recorded, so "no death recorded" reads as a deliberate
 * research state rather than a missing field.
 */
export function LifeSpine({
  milestones,
  individualId,
  treeId,
}: {
  milestones: OverviewMilestone[];
  individualId: string;
  treeId: string;
}): JSX.Element {
  const { t } = useTranslation('individuals');

  const born = milestones.find((m) => m.kind === 'born');
  const death = milestones.find((m) => m.kind === 'death');

  // Ordered list: born slot first, recorded milestones in the middle (excluding
  // born/death which have fixed positions), death slot last.
  type Row =
    | { type: 'milestone'; milestone: OverviewMilestone }
    | { type: 'missing'; kind: 'born' | 'death' };

  const rows: Row[] = [
    born ? { type: 'milestone', milestone: born } : { type: 'missing', kind: 'born' },
    ...milestones
      .filter((m) => m.kind !== 'born' && m.kind !== 'death')
      .map((m): Row => ({ type: 'milestone', milestone: m })),
    death ? { type: 'milestone', milestone: death } : { type: 'missing', kind: 'death' },
  ];

  return (
    <Card layout="sectioned">
      <PanelHead title={t('overview.milestone.title')}>
        <ViewAllLink
          to="/tree/$treeId/individual/$individualId/events"
          treeId={treeId}
          individualId={individualId}
        />
      </PanelHead>
      {rows.map((row) =>
        row.type === 'milestone' ? (
          <Milestone key={row.milestone.id} milestone={row.milestone} treeId={treeId} />
        ) : (
          <MissingMilestone
            key={`missing-${row.kind}`}
            label={t(`overview.milestone.missing${row.kind === 'born' ? 'Born' : 'Death'}`)}
          />
        )
      )}
      <div className={card.row}>
        {/* Event creation lands with the Events tab; the affordance ships inert
            so the panel already reads the way the mockup does. */}
        <Button variant="ghost" className={s.addEvent} disabled>
          <Icon name="plus" size={14} />
          {t('overview.milestone.addEvent')}
        </Button>
      </div>
    </Card>
  );
}

function MissingMilestone({ label }: { label: string }): JSX.Element {
  return (
    <div className={`${card.row} ${s.missingRow}`}>
      <span className={s.missingDot} />
      <Typography size="xs" tone="subtle">
        {label}
      </Typography>
    </div>
  );
}

function SpouseInline({ spouse, treeId }: { spouse: PersonRefData; treeId: string }): JSX.Element {
  const { t } = useTranslation('individuals');
  const dates = formatLifeYears(spouse, t);

  return (
    <IndividualLink treeId={treeId} individualId={spouse.id}>
      <div className={s.spouse}>
        <Avatar.Root size="sm">
          <Avatar.Image src={spouse.imageUrl} alt="" />
          <Avatar.Fallback>{spouse.initials}</Avatar.Fallback>
        </Avatar.Root>
        <Typography weight="semibold">{spouse.name}</Typography>
        {dates && (
          <Typography size="xs" tone="subtle">
            {dates}
          </Typography>
        )}
      </div>
    </IndividualLink>
  );
}

function Milestone({
  milestone,
  treeId,
}: {
  milestone: OverviewMilestone;
  treeId: string;
}): JSX.Element {
  const { t } = useTranslation('individuals');

  const title = t(`overview.milestone.${milestone.kind}`);

  const children = milestone.children ?? [];

  return (
    <div className={`${card.row} ${s.milestoneRow}`}>
      <div className={s.head}>
        <span className={s.kindPuck}>
          <Icon name={KIND_ICON[milestone.kind]} size={13} color={vars.color.brand.base} />
        </span>
        {/* Date and place are each dropped when unrecorded rather than left as
            an empty chip or a bare pin — a blank frame reads as a rendering
            fault, while their absence is ordinary in genealogical data. */}
        {milestone.date && <DataChip>{milestone.date}</DataChip>}
        <Typography size="md" weight="semibold">
          {title}
        </Typography>
        {milestone.spouse && <SpouseInline spouse={milestone.spouse} treeId={treeId} />}
        <div className={s.spacer} />
        {milestone.place && (
          <div className={s.placeInline}>
            <Icon name="map-pin" size={14} color={vars.color.text.muted} />
            <Typography tone="muted">{milestone.place}</Typography>
          </div>
        )}
      </div>

      {children.length > 0 && (
        <div className={s.childrenGroup}>
          <div className={s.childrenSpine} />
          <div className={s.childrenColumn}>
            <Typography size="xs" tone="muted">
              {t('overview.milestone.children')}
            </Typography>
            <div className={s.childrenList}>
              {children.map((child) => (
                <PersonRef key={child.id} person={child} variant="subtle" treeId={treeId} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
