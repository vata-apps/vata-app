# ADR-012: Leaflet + CARTO for the Places Map

**Status**: Accepted
**Date**: 2026-07-04

## Context

The "Places" panel on the Person Overview needs a map surface for places that carry coordinates. Vata is free and open-source, so the map stack must be free with no API key, and light given it's a supporting visual, not the app's core surface — while still fitting Vata's light/dark theming.

## Decision

Use **Leaflet** (`react-leaflet` v4, the last release supporting React 18) with free, keyless **CARTO** raster tiles — Positron for light, Dark Matter for dark, swapped via the app's resolved appearance. Markers use a custom `divIcon` styled with the Radix accent color rather than Leaflet's default (non-recolorable) pin icon. The map only plots geocoded places; the full place list still shows every place regardless of coordinates. Markers are not interactive in v1 (tooltip on hover only).

## Alternatives Considered

- **MapLibre GL + vector tiles**: rejected for v1 — full custom-colored basemaps require either an API key (MapTiler) or a young, single-maintainer keyless provider (OpenFreeMap), plus a heavier WebGL bundle. Leaflet's raster tiles stay free, keyless, and light; only the accent-colored markers and overlays need to be recolorable, not the whole basemap.
