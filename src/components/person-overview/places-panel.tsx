import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { eventTypeLabel } from '$lib/eventTypeLabel';
import { PlacesMap, type MapPoint } from '$components/map/places-map';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import * as card from '../ui/card.css';
import { EmptyState } from '../ui/empty-state';
import { Typography } from '../ui/typography';
import { PlaceLink } from './entity-links';
import type { OverviewPlaceLived } from './overview-types';
import { PanelHead, ViewAllUnavailable } from './panel';
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
 * The Places panel: a map of the person's geocoded places above a row for
 * every distinct place tied to their events (geocoded or not, including their
 * marriages), each linking to that Place and tagged with the event types
 * recorded there. Titled "Places" rather than "Places lived" since a marriage
 * or death location isn't necessarily a residence. Hovering a row highlights
 * its marker on the map.
 */
export function PlacesPanel({ places, treeId }: PlacesPanelProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const [highlightedPlaceId, setHighlightedPlaceId] = useState<string | null>(null);
  const mapPoints = useMemo(
    () => places.map(toMapPoint).filter((point): point is MapPoint => point !== null),
    [places]
  );

  return (
    <Card layout="sectioned">
      <PanelHead title={t('overview.placesLived.title')}>
        {places.length > 0 && <Badge>{places.length}</Badge>}
        <ViewAllUnavailable />
      </PanelHead>

      {mapPoints.length > 0 && (
        <div className={s.map}>
          <PlacesMap points={mapPoints} highlightedId={highlightedPlaceId} />
        </div>
      )}

      {places.length === 0 ? (
        <div className={card.row}>
          <EmptyState>{t('overview.placesLived.empty')}</EmptyState>
        </div>
      ) : (
        places.map((place) => (
          <div
            key={place.id}
            className={`${card.row} ${s.placeRow}`}
            onMouseEnter={() => setHighlightedPlaceId(place.id)}
            onMouseLeave={() => setHighlightedPlaceId(null)}
          >
            <PlaceLink treeId={treeId} placeId={place.id}>
              <Typography size="md" weight="semibold">
                {place.name}
              </Typography>
            </PlaceLink>
            {place.contexts.length > 0 && (
              <div className={s.tags}>
                {place.contexts.map((context) => (
                  <Badge key={context.id}>{eventTypeLabel(context, t)}</Badge>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </Card>
  );
}
