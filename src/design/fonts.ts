/**
 * Self-hosted brand fonts (ADR-0014), pulled from @fontsource. Import this once
 * where the design tokens are consumed. Family names here must match the
 * `font.*` token values in `theme.css.ts`.
 *
 * - Geist Sans: UI + body.
 * - Geist Mono: data (dates, IDs).
 * - Fraunces (italic only): the lineage signature — person names, hero, display
 *   titles. Upright Fraunces is intentionally not loaded; the serif is only ever
 *   used italic.
 */
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-sans/700.css';

import '@fontsource/geist-mono/400.css';
import '@fontsource/geist-mono/500.css';

import '@fontsource/fraunces/400-italic.css';
import '@fontsource/fraunces/500-italic.css';
import '@fontsource/fraunces/600-italic.css';
