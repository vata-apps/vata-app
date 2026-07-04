import 'leaflet/dist/leaflet.css';

import { useThemeContext } from '@radix-ui/themes';
import * as L from 'leaflet';
import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet';

/** A geocoded point to plot on the map — a place lived-in, a place's own location, etc. */
export interface MapPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface PlacesMapProps {
  points: MapPoint[];
  /** Id of the point to render with the highlighted marker style, if any. */
  highlightedId?: string | null;
}

const TILE_URLS: Record<'light' | 'dark', string> = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};

const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const MARKER_ICON = L.divIcon({
  className: 'vata-place-marker',
  html: '<span style="display:block;width:14px;height:14px;border-radius:9999px;background:var(--accent-9);border:2px solid var(--color-panel-solid);box-shadow:0 0 0 1px var(--gray-a6);"></span>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const HIGHLIGHTED_MARKER_ICON = L.divIcon({
  className: 'vata-place-marker vata-place-marker--highlighted',
  html: '<span style="display:block;width:20px;height:20px;border-radius:9999px;background:var(--accent-9);border:2px solid var(--color-panel-solid);box-shadow:0 0 0 1px var(--gray-a6), 0 0 0 5px var(--accent-a5);"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

/**
 * Fits the map view to the given points, with padding. A single point still
 * works: Leaflet's `maxZoom` caps how far `fitBounds` zooms into a
 * zero-size (single-point) bounds, landing at a city-level zoom.
 */
function FitBounds({ points }: { points: MapPoint[] }): null {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;

    const bounds = L.latLngBounds(
      points.map((point): L.LatLngTuple => [point.latitude, point.longitude])
    );
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 10 });
  }, [map, points]);

  return null;
}

/**
 * A themed Leaflet map plotting the given points as accent-colored markers
 * with hover tooltips. The basemap swaps between CARTO Positron and Dark
 * Matter with the app's resolved light/dark appearance. Shared by anywhere
 * geocoded places need a map surface (Person Overview's Places panel,
 * the Place detail page).
 */
export function PlacesMap({ points, highlightedId }: PlacesMapProps): JSX.Element {
  const { appearance } = useThemeContext();
  const tileUrl = appearance === 'dark' ? TILE_URLS.dark : TILE_URLS.light;

  return (
    <MapContainer
      center={[0, 0]}
      zoom={2}
      scrollWheelZoom={false}
      style={{ height: 280, width: '100%', borderRadius: 'var(--radius-3)' }}
    >
      <TileLayer url={tileUrl} attribution={TILE_ATTRIBUTION} subdomains="abcd" />
      <FitBounds points={points} />
      {points.map((point) => (
        <Marker
          key={point.id}
          position={[point.latitude, point.longitude]}
          icon={point.id === highlightedId ? HIGHLIGHTED_MARKER_ICON : MARKER_ICON}
        >
          <Tooltip>{point.name}</Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
