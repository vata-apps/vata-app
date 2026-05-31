import { Map, Marker } from 'pigeon-maps';
import { Card, Flex, Heading, Separator, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { useAppStore } from '$/store/app-store';
import type { OverviewPlaceLegend } from './overview-mock';

interface PlacesPanelProps {
  legend: OverviewPlaceLegend[];
}

const LEGEND_HEIGHT_PX = 44;

/**
 * Computes the center and zoom that fits all pins. The center is shifted
 * northward by half the legend overlay height so pins aren't obscured.
 */
function getBounds(places: OverviewPlaceLegend[]): {
  center: [number, number];
  zoom: number;
} {
  if (places.length === 0) return { center: [46.8, -71.2], zoom: 8 };
  if (places.length === 1) {
    // Shift center north to clear the legend
    const zoom = 11;
    const latPerPx = 360 / (256 * Math.pow(2, zoom));
    const latOffset = (LEGEND_HEIGHT_PX / 2) * latPerPx;
    return { center: [places[0].lat - latOffset, places[0].lng], zoom };
  }

  const lats = places.map((p) => p.lat);
  const lngs = places.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const span = Math.max(maxLat - minLat, maxLng - minLng);

  let zoom = 13;
  if (span > 8) zoom = 5;
  else if (span > 4) zoom = 6;
  else if (span > 2) zoom = 7;
  else if (span > 1) zoom = 7;
  else if (span > 0.5) zoom = 8;
  else if (span > 0.1) zoom = 10;
  else if (span > 0.05) zoom = 12;

  // Shift center north by half the legend height in lat degrees
  const latPerPx = 360 / (256 * Math.pow(2, zoom));
  const latOffset = (LEGEND_HEIGHT_PX / 2) * latPerPx;
  const centerLat = (minLat + maxLat) / 2 - latOffset;
  const centerLng = (minLng + maxLng) / 2;

  return { center: [centerLat, centerLng], zoom };
}

const DARK_QUERY = '(prefers-color-scheme: dark)';

// CARTO tiles — free, no API key required
function cartoProvider(style: 'dark_all' | 'light_all') {
  return (x: number, y: number, z: number): string => {
    const s = ['a', 'b', 'c', 'd'][Math.floor(Math.random() * 4)];
    return `https://${s}.basemaps.cartocdn.com/${style}/${z}/${x}/${y}.png`;
  };
}

function useCartoProvider() {
  const theme = useAppStore((state) => state.theme);
  const systemDark = window.matchMedia(DARK_QUERY).matches;
  const isDark = theme === 'dark' || (theme === 'system' && systemDark);
  return isDark ? cartoProvider('dark_all') : cartoProvider('light_all');
}

// Indigo-600 hardcoded — CSS variables don't resolve inside pigeon-maps SVG
const PIN_COLOR = '#3e63dd';

/**
 * A card showing an OpenStreetMap surface (pigeon-maps) with one pin per life
 * event place, followed by a place list styled like the children block in the
 * life-spine: a vertical separator spine with indented inline items.
 */
export function PlacesPanel({ legend }: PlacesPanelProps): JSX.Element {
  const { t } = useTranslation('individuals');
  const { center, zoom } = getBounds(legend);
  const provider = useCartoProvider();

  return (
    <Card
      style={
        {
          overflow: 'hidden',
          padding: 0,
          position: 'relative',
          '--color-overlay': 'color-mix(in srgb, var(--color-panel-solid) 85%, transparent)',
        } as React.CSSProperties
      }
    >
      {/* Map fills the full card */}
      <Map
        center={center}
        zoom={zoom}
        height={360}
        provider={provider}
        attribution={false}
        mouseEvents={false}
        touchEvents={false}
        boxClassname="places-panel-map"
      >
        {legend.map((place) => (
          <Marker key={place.place} anchor={[place.lat, place.lng]} color={PIN_COLOR} width={32} />
        ))}
      </Map>

      {/* Legend panel — frosted glass overlay anchored to the bottom */}
      <Flex
        direction="column"
        gap="2"
        p="3"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: 'var(--color-overlay)',
          borderTop: '1px solid var(--gray-a4)',
        }}
      >
        <Heading size="4">{t('overview.places.title')}</Heading>
        <Flex ml="2" gap="3" align="stretch">
          <Separator orientation="vertical" size="4" style={{ height: 'auto' }} />
          <Flex gap="3" wrap="wrap" align="center">
            {legend.map((place) => (
              <Flex key={place.place} align="baseline" gap="2">
                <Text size="2" weight="medium">
                  {place.place}
                </Text>
                <Text size="1" color="gray">
                  {place.detail}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
