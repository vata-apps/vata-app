import { useTranslation } from 'react-i18next';

import { Card } from '../ui/card';
import * as card from '../ui/card.css';
import { Typography } from '../ui/typography';
import { PlaceLink } from './entity-links';
import type { OverviewVital } from './overview-types';
import * as s from './vitals-panel.css';

interface VitalsPanelProps {
  vitals: OverviewVital[];
  treeId: string;
}

/**
 * The Vitals panel: the person's birth and death, each with its date and a
 * linked place. Only recorded vitals are shown — an inline "add" affordance
 * waits on editing support.
 *
 * `OverviewVital.sourced` carries real citation data, but this panel doesn't
 * render a "sourced" indicator yet — that visual returns once the Sources
 * screens are rebuilt.
 */
export function VitalsPanel({ vitals, treeId }: VitalsPanelProps): JSX.Element {
  const { t } = useTranslation('individuals');

  return (
    <Card>
      <div className={card.stack}>
        <Typography as="h2" size="15" weight="650">
          {t('overview.vitals.title')}
        </Typography>
        {vitals.length === 0 ? (
          <Typography tone="muted">{t('overview.vitals.empty')}</Typography>
        ) : (
          <div className={card.list}>
            {vitals.map((vital, index) => (
              <div key={vital.kind}>
                {index > 0 && <div className={card.separator} />}
                <VitalRow vital={vital} treeId={treeId} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function VitalRow({ vital, treeId }: { vital: OverviewVital; treeId: string }): JSX.Element {
  const { t } = useTranslation('individuals');

  return (
    <div className={s.row}>
      <div className={s.rowHead}>
        <Typography size="12.5" tone="muted">
          {t(`overview.vitals.${vital.kind}`)}
        </Typography>
      </div>
      <div className={s.rowBody}>
        {vital.date && <Typography>{vital.date}</Typography>}
        {vital.placeId && vital.placeName && (
          <PlaceLink treeId={treeId} placeId={vital.placeId}>
            <Typography tone="muted">{vital.placeName}</Typography>
          </PlaceLink>
        )}
        {!vital.date && !vital.placeName && <Typography tone="muted">—</Typography>}
      </div>
    </div>
  );
}
