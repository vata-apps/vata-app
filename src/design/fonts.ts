/**
 * Self-hosted brand fonts (ADR-0005), pulled from @fontsource. Import this once
 * where the design tokens are consumed. Family names here must match the
 * `font.*` token values in `theme.css.ts`.
 *
 * - IBM Plex Sans: UI + body.
 * - IBM Plex Mono: data (dates, IDs, coordinates, counts).
 * - Spectral: the lineage signature — person names, drafts, empty states only.
 *
 * Only the weight/style cuts actually used by the app are imported here — each
 * one is a real bundled webfont file. Add a cut when a screen needs it.
 */
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans/700.css';

import '@fontsource/ibm-plex-mono/400.css';

import '@fontsource/spectral/400-italic.css';
