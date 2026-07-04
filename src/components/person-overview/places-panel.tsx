import { Badge, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { eventTypeLabel } from '$lib/eventTypeLabel';
import { PlacesMap, type MapPoint } from '$components/map/places-map';
import { PlaceLink } from './entity-links';
import type { OverviewPlaceLived } from './overview-types';

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
      <Flex direction="column" gap="3">
        <Flex align="center" gap="2">
          <Heading size="4">{t('overview.placesLived.title')}</Heading>
          {places.length > 0 && (
            <Badge variant="soft" color="gray" radius="full">
              {places.length}
            </Badge>
          )}
        </Flex>

        {mapPoints.length > 0 && (
          <PlacesMap points={mapPoints} highlightedId={highlightedPlaceId} />
        )}

        {places.length === 0 ? (
          <Text size="2" color="gray">
            {t('overview.placesLived.empty')}
          </Text>
        ) : (
          <Flex gap="3" wrap="wrap">
            {places.map((place) => (
              <PlaceLink key={place.id} treeId={treeId} placeId={place.id}>
                <Card
                  onMouseEnter={() => setHighlightedPlaceId(place.id)}
                  onMouseLeave={() => setHighlightedPlaceId(null)}
                >
                  <Flex direction="column" gap="1">
                    <Text size="2" weight="medium">
                      {place.name}
                    </Text>
                    <Text size="1" color="gray">
                      {place.contexts.map((context) => eventTypeLabel(context, t)).join(' · ')}
                    </Text>
                  </Flex>
                </Card>
              </PlaceLink>
            ))}
          </Flex>
        )}
      </Flex>
    </Card>
  );
}
