import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { eventTypeLabel } from '$lib/eventTypeLabel';
import { PlacesMap, type MapPoint } from '$components/map/places-map';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import * as card from '../ui/card.css';
import { Typography } from '../ui/typography';
import { PlaceLink } from './entity-links';
import type { OverviewPlaceLived } from './overview-types';
import * as s from './places-panel.css';

interface PlacesPanelProps {
  places: OverviewPlaceLived[];
  treeId: string;
}

function toMapPoint(place: OverviewPlaceLived): MapPoint | null {
  if (place.latitude === null || place.longitude === null) return null;
  return { id: place.id, name: place.name, latitude: place.latitude, longitude: place.longitude };
}

/**
 * The full-width Places panel: a map of the person's geocoded places above
 * chips for every distinct place tied to their events (geocoded or not,
 * including their marriages), each chip linking to that Place and annotated
 * with the event types recorded there. Titled "Places" rather than "Places
 * lived" since a marriage or death location isn't necessarily a residence.
 * Hovering a chip highlights its marker on the map.
 */
export function PlacesPanel({ places, treeId }: PlacesPanelProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const [highlightedPlaceId, setHighlightedPlaceId] = useState<string | null>(null);
  const mapPoints = useMemo(
    () => places.map(toMapPoint).filter((point): point is MapPoint => point !== null),
    [places]
  );

  return (
    <Card>
      <div className={card.stack}>
        <div className={s.head}>
          <Typography as="h2" size="15" weight="650">
            {t('overview.placesLived.title')}
          </Typography>
          {places.length > 0 && <Badge>{places.length}</Badge>}
        </div>

        {mapPoints.length > 0 && (
          <PlacesMap points={mapPoints} highlightedId={highlightedPlaceId} />
        )}

        {places.length === 0 ? (
          <Typography tone="muted">{t('overview.placesLived.empty')}</Typography>
        ) : (
          <div className={s.chips}>
            {places.map((place) => (
              <PlaceLink key={place.id} treeId={treeId} placeId={place.id}>
                <Card
                  className={s.chip}
                  onMouseEnter={() => setHighlightedPlaceId(place.id)}
                  onMouseLeave={() => setHighlightedPlaceId(null)}
                >
                  <div className={s.chipBody}>
                    <Typography weight="550">{place.name}</Typography>
                    <Typography size="12.5" tone="faint">
                      {place.contexts.map((context) => eventTypeLabel(context, t)).join(' · ')}
                    </Typography>
                  </div>
                </Card>
              </PlaceLink>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
