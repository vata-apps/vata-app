import { Badge, Card, Flex, Heading, Separator, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { PlaceLink } from './entity-links';
import type { OverviewVital } from './build-overview';

interface VitalsPanelProps {
  vitals: OverviewVital[];
  treeId: string;
}

/**
 * The Vitals panel: the person's birth and death, each with its date, a linked
 * place, and a "sourced" badge when the event carries a citation. Only recorded
 * vitals are shown — an inline "add" affordance waits on editing support.
 */
export function VitalsPanel({ vitals, treeId }: VitalsPanelProps): JSX.Element {
  const { t } = useTranslation('individuals');

  return (
    <Card>
      <Flex direction="column" gap="3">
        <Heading size="4">{t('overview.vitals.title')}</Heading>
        {vitals.length === 0 ? (
          <Text size="2" color="gray">
            {t('overview.vitals.empty')}
          </Text>
        ) : (
          <Flex direction="column">
            {vitals.map((vital, index) => (
              <Flex key={vital.kind} direction="column">
                {index > 0 && <Separator size="4" my="3" />}
                <VitalRow vital={vital} treeId={treeId} />
              </Flex>
            ))}
          </Flex>
        )}
      </Flex>
    </Card>
  );
}

function VitalRow({ vital, treeId }: { vital: OverviewVital; treeId: string }): JSX.Element {
  const { t } = useTranslation('individuals');

  return (
    <Flex direction="column" gap="1">
      <Flex align="center" gap="2">
        <Text size="1" color="gray">
          {t(`overview.vitals.${vital.kind}`)}
        </Text>
        {vital.sourced && (
          <Badge size="1" color="grass" variant="soft">
            {t('overview.vitals.sourced')}
          </Badge>
        )}
      </Flex>
      <Flex align="baseline" gap="2" wrap="wrap">
        {vital.date && <Text size="2">{vital.date}</Text>}
        {vital.placeId && vital.placeName && (
          <PlaceLink treeId={treeId} placeId={vital.placeId}>
            <Text size="2" color="gray">
              {vital.placeName}
            </Text>
          </PlaceLink>
        )}
        {!vital.date && !vital.placeName && (
          <Text size="2" color="gray">
            —
          </Text>
        )}
      </Flex>
    </Flex>
  );
}
