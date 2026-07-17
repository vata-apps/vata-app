import { useTranslation } from 'react-i18next';

import { vars } from '$/design/theme.css';
import { Icon } from '../icon';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import * as card from '../ui/card.css';
import { Typography } from '../ui/typography';
import { IndividualLink } from './entity-links';
import * as s from './life-spine.css';
import type { OverviewMilestone, PersonRefData } from './overview-types';
import { formatLifeDates, PersonRef } from './person-ref';

/**
 * The life events — a person's key vital events (birth, marriages, death) in
 * one card, each a separator-divided row led by its (possibly imprecise) date
 * in a `Badge`.
 *
 * Born and death slots are always rendered — a blank state row appears when
 * the event is not yet recorded.
 */
export function LifeSpine({
  milestones,
  treeId,
}: {
  milestones: OverviewMilestone[];
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
    <Card>
      <div className={card.stack}>
        <Typography as="h2" size="15" weight="650">
          {t('overview.milestone.title')}
        </Typography>
        <div className={card.list}>
          {rows.map((row, i) => (
            <div key={row.type === 'milestone' ? row.milestone.id : `missing-${row.kind}`}>
              {i > 0 && <div className={card.separator} />}
              {row.type === 'milestone' ? (
                <Milestone milestone={row.milestone} treeId={treeId} />
              ) : (
                <MissingMilestone
                  label={t(`overview.milestone.missing${row.kind === 'born' ? 'Born' : 'Death'}`)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function MissingMilestone({ label }: { label: string }): JSX.Element {
  return (
    <div className={s.missingRow}>
      <Icon name="circle" size={14} color={vars.color.faint} />
      <Typography tone="muted">{label}</Typography>
    </div>
  );
}

function SpouseInline({ spouse, treeId }: { spouse: PersonRefData; treeId: string }): JSX.Element {
  const dates = formatLifeDates(spouse);

  return (
    <IndividualLink treeId={treeId} individualId={spouse.id}>
      <div className={s.spouse}>
        <Avatar.Root size="sm">
          <Avatar.Image src={spouse.imageUrl} alt="" />
          <Avatar.Fallback>{spouse.initials}</Avatar.Fallback>
        </Avatar.Root>
        <Typography weight="550">{spouse.name}</Typography>
        {dates && (
          <Typography size="12.5" tone="faint">
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
    <div className={s.row}>
      <div className={s.head}>
        <Badge>{milestone.date}</Badge>
        <Typography size="15" weight="550">
          {title}
        </Typography>
        {milestone.spouse && <SpouseInline spouse={milestone.spouse} treeId={treeId} />}
        <div className={s.spacer} />
        <div className={s.placeInline}>
          <Icon name="map-pin" size={14} color={vars.color.muted} />
          <Typography tone="muted">{milestone.place}</Typography>
        </div>
      </div>

      {children.length > 0 && (
        <div className={s.childrenGroup}>
          <div className={s.childrenSpine} />
          <div className={s.childrenColumn}>
            <Typography size="12.5" tone="muted">
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
