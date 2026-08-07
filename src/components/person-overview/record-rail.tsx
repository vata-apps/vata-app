import { useTranslation } from 'react-i18next';

import { vars } from '$/design/theme.css';
import { Icon } from '../icon';
import { Card } from '../ui/card';
import * as card from '../ui/card.css';
import { EmptyState } from '../ui/empty-state';
import { Typography } from '../ui/typography';
import type { OverviewName, OverviewParents, PersonRefData } from './overview-types';
import { PanelHead, ViewAllLink, ViewAllUnavailable } from './panel';
import { PersonRef } from './person-ref';
import * as s from './record-rail.css';

interface RecordRailProps {
  parents: OverviewParents;
  names: OverviewName[];
  individualId: string;
  treeId: string;
}

/**
 * The left record rail: the parents panel, the names panel, and the media
 * panel. `PersonRef` for parents, flat rows for names, and an empty-state
 * media panel (per-person media has no data model yet).
 */
export function RecordRail({ parents, names, individualId, treeId }: RecordRailProps): JSX.Element {
  return (
    <div className={s.rail}>
      <ParentsPanel parents={parents} individualId={individualId} treeId={treeId} />
      <NamesPanel names={names} individualId={individualId} treeId={treeId} />
      <MediaPanel />
    </div>
  );
}

function ParentsPanel({
  parents,
  individualId,
  treeId,
}: {
  parents: OverviewParents;
  individualId: string;
  treeId: string;
}): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Card layout="sectioned">
      <PanelHead title={t('overview.parents.title')}>
        <ViewAllLink
          to="/tree/$treeId/individual/$individualId/relations"
          treeId={treeId}
          individualId={individualId}
        />
      </PanelHead>
      {/* Always two fixed slots: father on top, mother below. Missing slots
          show a muted label instead of a PersonRef. */}
      <ParentSlot role="father" person={parents.father} treeId={treeId} />
      <ParentSlot role="mother" person={parents.mother} treeId={treeId} />
    </Card>
  );
}

function ParentSlot({
  role,
  person,
  treeId,
}: {
  role: 'father' | 'mother';
  person?: PersonRefData;
  treeId: string;
}): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <div className={`${card.row} ${s.parentRow}`}>
      {person ? (
        <PersonRef person={person} treeId={treeId} />
      ) : (
        <div className={s.missingSlot}>
          <Icon name="user" size={14} color={vars.color.text.subtle} />
          <Typography tone="muted">{t(`overview.parents.${role}.missing`)}</Typography>
        </div>
      )}
      <Typography size="xs" tone="muted" className={s.roleLabel}>
        {t(`overview.parents.${role}.label`)}
      </Typography>
    </div>
  );
}

function NamesPanel({
  names,
  individualId,
  treeId,
}: {
  names: OverviewName[];
  individualId: string;
  treeId: string;
}): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Card layout="sectioned">
      <PanelHead title={t('overview.names.title')}>
        <ViewAllLink
          to="/tree/$treeId/individual/$individualId/names"
          treeId={treeId}
          individualId={individualId}
        />
      </PanelHead>
      {names.map((name) => (
        <NameRow key={name.id} name={name} />
      ))}
    </Card>
  );
}

function NameRow({ name }: { name: OverviewName }): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <div className={`${card.row} ${s.nameRow}`}>
      <div className={s.nameRowHead}>
        <Typography size="xs" tone="muted">
          {t(`overview.names.types.${name.type}`)}
        </Typography>
        {name.isPrimary && (
          <Typography size="xs" weight="semibold" tone="brand">
            {t('overview.names.primary')}
          </Typography>
        )}
      </div>
      <Typography size="md">{name.text}</Typography>
    </div>
  );
}

function MediaPanel(): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Card layout="sectioned">
      <PanelHead title={t('overview.media.title')}>
        <ViewAllUnavailable />
      </PanelHead>
      <div className={card.row}>
        <EmptyState>{t('overview.media.empty')}</EmptyState>
      </div>
    </Card>
  );
}
