import { Badge, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { eventTypeLabel } from '$lib/eventTypeLabel';
import { PlaceLink } from './entity-links';
import type { OverviewPlaceLived } from './overview-types';

interface PlacesLivedPanelProps {
  places: OverviewPlaceLived[];
  treeId: string;
}

/**
 * The full-width Places lived panel: the distinct places tied to the person's
 * events, each a chip linking to that Place and annotated with the event types
 * recorded there. A map surface is deferred until places carry coordinates.
 */
export function PlacesLivedPanel({ places, treeId }: PlacesLivedPanelProps): JSX.Element {
  const { t } = useTranslation('individuals');

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

        {places.length === 0 ? (
          <Text size="2" color="gray">
            {t('overview.placesLived.empty')}
          </Text>
        ) : (
          <Flex gap="3" wrap="wrap">
            {places.map((place) => (
              <PlaceLink key={place.id} treeId={treeId} placeId={place.id}>
                <Card>
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
