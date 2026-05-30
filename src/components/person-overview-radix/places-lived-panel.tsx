import { Badge, Card, Flex, Grid, Heading, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import type { OverviewPlaceLegend } from './overview-mock';

interface PlacesLivedPanelProps {
  region: string;
  legend: OverviewPlaceLegend[];
}

/**
 * The "Places lived" panel. The PoC rendered a faux map surface with
 * positioned pins; that has no `@radix-ui/themes` primitive, so this pure-Radix
 * variant drops the map and keeps the header plus the numbered legend, each
 * row a `Card` with a `Badge` index.
 */
export function PlacesLivedPanel({ region, legend }: PlacesLivedPanelProps): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Card size="3">
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between" gap="3" wrap="wrap">
          <Flex direction="column">
            <Heading size="5">{t('overview.places.title')}</Heading>
            <Text size="2" color="gray">
              {t('overview.places.subtitle', { count: legend.length, region })}
            </Text>
          </Flex>
          <Text size="2" color="teal">
            {t('overview.places.manage')}
          </Text>
        </Flex>

        <Grid columns={{ initial: '1', sm: '3' }} gap="3">
          {legend.map((entry, i) => (
            <Card key={entry.place}>
              <Flex align="center" gap="3">
                <Badge variant="soft" radius="full" size="2">
                  {i + 1}
                </Badge>
                <Flex direction="column" minWidth="0">
                  <Text size="3" color="teal" truncate>
                    {entry.place}
                  </Text>
                  <Text size="1" color="gray" truncate>
                    {entry.detail}
                  </Text>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Grid>
      </Flex>
    </Card>
  );
}
