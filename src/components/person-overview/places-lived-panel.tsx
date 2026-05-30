import { Box, Card, Flex, Grid, Heading, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { Icon } from '$components/icon';
import type { OverviewPin, OverviewPlaceLegend } from './overview-mock';
import { PANEL_SURFACE } from './panel';

interface PlacesLivedPanelProps {
  region: string;
  pins: OverviewPin[];
  legend: OverviewPlaceLegend[];
}

/** A faint grid pattern that reads the map surface as a placeholder canvas. */
const MAP_SURFACE: React.CSSProperties = {
  background:
    'linear-gradient(var(--gray-a3) 1px, transparent 1px) 0 0 / 44px 44px,' +
    'linear-gradient(90deg, var(--gray-a3) 1px, transparent 1px) 0 0 / 44px 44px,' +
    'radial-gradient(circle at 50% 40%, var(--gray-3), var(--gray-1))',
  border: '1px solid var(--gray-a6)',
  borderRadius: 'var(--radius-3)',
};

/**
 * The "Places lived" panel — a map surface with positioned place pins and a
 * numbered legend beneath it.
 */
export function PlacesLivedPanel({ region, pins, legend }: PlacesLivedPanelProps): JSX.Element {
  const { t } = useTranslation('individuals');
  return (
    <Card size="3">
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between" gap="3" wrap="wrap">
          <Flex direction="column">
            <Heading size="5">{t('overview.places.title')}</Heading>
            <Text size="2" color="gray">
              {t('overview.places.subtitle', { count: pins.length, region })}
            </Text>
          </Flex>
          <Flex align="center" gap="1">
            <Text size="2" color="teal">
              {t('overview.places.manage')} →
            </Text>
          </Flex>
        </Flex>

        <Box position="relative" height="360px" overflow="hidden" style={MAP_SURFACE}>
          {pins.map((pin) => (
            <Flex
              key={pin.id}
              align="center"
              gap="2"
              position="absolute"
              style={{ left: `${pin.left}%`, top: `${pin.top}%` }}
            >
              <Icon
                name="map-pin"
                size={24}
                style={{ color: 'var(--accent-9)' }}
                aria-hidden={false}
                aria-label={pin.place}
              />
              <Box
                px="2"
                py="1"
                style={{
                  background: 'var(--gray-2)',
                  border: '1px solid var(--gray-a6)',
                  borderRadius: 'var(--radius-2)',
                }}
              >
                <Text size="2" as="div">
                  {pin.place}
                </Text>
                <Text size="1" color="gray" as="div">
                  {pin.detail}
                </Text>
              </Box>
            </Flex>
          ))}
        </Box>

        <Grid columns={{ initial: '1', sm: '3' }} gap="3">
          {legend.map((entry, i) => (
            <Flex key={entry.place} align="center" gap="3" p="3" style={PANEL_SURFACE}>
              <Flex
                align="center"
                justify="center"
                width="30px"
                height="30px"
                flexShrink="0"
                style={{ borderRadius: '50%', border: '1px solid var(--accent-8)' }}
              >
                <Text size="2" style={{ color: 'var(--accent-11)' }}>
                  {i + 1}
                </Text>
              </Flex>
              <Flex direction="column" minWidth="0">
                <Text size="3" color="teal" truncate>
                  {entry.place}
                </Text>
                <Text size="1" style={{ color: 'var(--gray-10)' }} truncate>
                  {entry.detail}
                </Text>
              </Flex>
            </Flex>
          ))}
        </Grid>
      </Flex>
    </Card>
  );
}
