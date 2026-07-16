import { useTranslation } from 'react-i18next';

import { vars } from '$/design/theme.css';
import { Icon } from '../icon';
import { Card } from '../ui/card';
import * as card from '../ui/card.css';
import { Typography } from '../ui/typography';
import type { OverviewName, OverviewParents, PersonRefData } from './overview-types';
import { PersonRef } from './person-ref';
import * as s from './record-rail.css';

interface RecordRailProps {
  parents: OverviewParents;
  names: OverviewName[];
  treeId: string;
}

/**
 * The left record rail: the parents panel, the names panel, and the media
 * panel. `PersonRef` for parents, flat rows for names, and an empty-state
 * media panel (per-person media has no data model yet).
 */
export function RecordRail({ parents, names, treeId }: RecordRailProps): JSX.Element {
  return (
    <div className={s.rail}>
      <ParentsPanel parents={parents} treeId={treeId} />
      <NamesPanel names={names} />
      <MediaPanel />
    </div>
  );
}

function ParentsPanel({
  parents,
  treeId,
}: {
  parents: OverviewParents;
  treeId: string;
}): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Card>
      <div className={card.stack}>
        <Typography as="h2" size="15" weight="650">
          {t('overview.parents.title')}
        </Typography>
        {/* Always two fixed slots: father on top, mother below. Missing slots
            show a muted label instead of a PersonRef. */}
        <div className={card.list}>
          <ParentSlot
            missingLabel={t('overview.parents.missingFather')}
            person={parents.father}
            treeId={treeId}
          />
          <div className={card.separator} />
          <ParentSlot
            missingLabel={t('overview.parents.missingMother')}
            person={parents.mother}
            treeId={treeId}
          />
        </div>
      </div>
    </Card>
  );
}

interface ParentSlotProps {
  missingLabel: string;
  person?: PersonRefData;
  treeId: string;
}

function ParentSlot({ missingLabel, person, treeId }: ParentSlotProps): JSX.Element {
  if (person) {
    return <PersonRef person={person} treeId={treeId} />;
  }
  return (
    <div className={s.missingSlot}>
      <Icon name="user" size={14} color={vars.color.faint} />
      <Typography tone="muted">{missingLabel}</Typography>
    </div>
  );
}

function NamesPanel({ names }: { names: OverviewName[] }): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Card>
      <div className={card.stack}>
        <Typography as="h2" size="15" weight="650">
          {t('overview.names.title')}
        </Typography>
        {/* Flat, separator-divided rows — same list pattern as Parents. */}
        <div className={card.list}>
          {names.map((name, i) => (
            <div key={name.id}>
              {i > 0 && <div className={card.separator} />}
              <NameRow name={name} />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function NameRow({ name }: { name: OverviewName }): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <div className={s.nameRow}>
      <div className={s.nameRowHead}>
        <Typography size="12.5" tone="muted">
          {t(`overview.names.types.${name.type}`)}
        </Typography>
        {name.isPrimary && (
          <Typography size="12.5" tone="accent">
            {t('overview.names.primary')}
          </Typography>
        )}
      </div>
      <Typography size="15">{name.text}</Typography>
    </div>
  );
}

function MediaPanel(): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Card>
      <div className={card.stack}>
        <Typography as="h2" size="15" weight="650">
          {t('overview.media.title')}
        </Typography>
        <div className={s.mediaEmpty}>
          <Typography tone="muted">{t('overview.media.empty')}</Typography>
        </div>
      </div>
    </Card>
  );
}
