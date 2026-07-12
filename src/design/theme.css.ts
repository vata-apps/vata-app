/**
 * Vata design tokens — the single source of visual truth (ADR-0014).
 *
 * A typed, zero-runtime Vanilla Extract contract. Every styled component reads
 * `vars.*`; raw color/size values live ONLY here. Warm-earth identity: terracotta
 * (clay) accent over warm sand neutrals, all in oklch. Geist Sans for UI, Geist
 * Mono for data, Fraunces (italic) reserved for lineage moments.
 *
 * Ported from the maintainer's design system. Lean by intent (ADR-0014): the
 * contract holds what the product uses today and grows as screens demand it — no
 * inherited shadcn/Radix semantic sprawl.
 *
 * Light is the default on `:root`; dark applies via `:root[data-theme="dark"]`
 * (set from the resolved app appearance) and, as a fallback, via
 * `prefers-color-scheme` when no attribute is present.
 */
import { assignVars, createGlobalThemeContract, globalStyle } from '@vanilla-extract/css';

export const vars = createGlobalThemeContract(
  {
    color: {
      /** App canvas. */
      ground: null,
      /** Raised surfaces: cards, modal, inputs. */
      panel: null,
      /** Secondary surface: popovers, nested panels. */
      panel2: null,
      /** Subtle fills: segmented track, hover wells. */
      subtle: null,
      /** Hairline separators. */
      border: null,
      /** Field / control borders. */
      borderStrong: null,
      /** Primary text. */
      text: null,
      /** Secondary text, labels. */
      muted: null,
      /** Tertiary text, placeholders, hints. */
      faint: null,
      /** Terracotta accent (primary). */
      accent: null,
      accentHover: null,
      /** Tinted accent fill: avatars, hint bars. */
      accentSoft: null,
      accentBorder: null,
      /** Text/glyphs on an accent fill. */
      accentText: null,
      success: null,
      warn: null,
      danger: null,
      /** Modal backdrop. */
      scrim: null,
    },
    radius: { base: null, sm: null },
    shadow: { sm: null, lg: null },
    font: { sans: null, serif: null, mono: null },
  },
  (_value, path) => `vata-${path.join('-')}`
);

const font = {
  sans: '"Geist Sans", ui-sans-serif, system-ui, sans-serif',
  serif: '"Fraunces", ui-serif, Georgia, serif',
  mono: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
};

const radius = { base: '0.625rem', sm: '0.4375rem' };

const light = {
  color: {
    ground: 'oklch(0.985 0.012 85)', // sand-50
    panel: 'oklch(1 0 0)',
    panel2: 'oklch(0.965 0.018 82)', // sand-100
    subtle: 'oklch(0.945 0.021 82)',
    border: 'oklch(0.22 0.028 45 / 0.10)',
    borderStrong: 'oklch(0.22 0.028 45 / 0.16)',
    text: 'oklch(0.22 0.028 45)', // sand-900
    muted: 'oklch(0.46 0.055 52)', // sand-700
    faint: 'oklch(0.60 0.05 58)',
    accent: 'oklch(0.54 0.13 32)', // clay-600
    accentHover: 'oklch(0.45 0.115 30)', // clay-700
    accentSoft: 'oklch(0.93 0.035 42)', // clay-100
    accentBorder: 'oklch(0.87 0.055 40)', // clay-200
    accentText: 'oklch(0.985 0.012 85)', // warm white
    success: 'oklch(0.52 0.13 145)',
    warn: 'oklch(0.64 0.15 70)',
    danger: 'oklch(0.555 0.195 27)',
    scrim: 'oklch(0.22 0.028 45 / 0.55)',
  },
  radius,
  shadow: {
    sm: '0 1px 3px oklch(0.2 0.02 50 / 0.08), 0 1px 2px oklch(0.2 0.02 50 / 0.06)',
    lg: '0 12px 28px oklch(0.2 0.02 50 / 0.12), 0 4px 10px oklch(0.2 0.02 50 / 0.08)',
  },
  font,
};

const dark = {
  color: {
    ground: 'oklch(0.155 0.02 42)', // sand-950
    panel: 'oklch(0.195 0.022 44)',
    panel2: 'oklch(0.235 0.02 44)',
    subtle: 'oklch(0.255 0.025 44)',
    border: 'oklch(1 0 0 / 0.08)',
    borderStrong: 'oklch(1 0 0 / 0.14)',
    text: 'oklch(0.90 0.022 80)', // sand-200 — softened off-white (pure white reads too harsh on the dark panels)
    muted: 'oklch(0.78 0.042 70)', // sand-400
    faint: 'oklch(0.62 0.035 60)',
    accent: 'oklch(0.62 0.125 34)', // clay-500
    accentHover: 'oklch(0.70 0.105 36)', // clay-400
    accentSoft: 'oklch(0.295 0.065 28)',
    accentBorder: 'oklch(0.36 0.09 28)', // clay-800
    accentText: 'oklch(0.985 0.012 85)',
    success: 'oklch(0.64 0.115 145)',
    warn: 'oklch(0.75 0.15 70)',
    danger: 'oklch(0.635 0.18 27)',
    scrim: 'oklch(0.12 0.01 45 / 0.70)',
  },
  radius,
  shadow: {
    sm: '0 1px 2px oklch(0 0 0 / 0.5)',
    lg: '0 12px 28px oklch(0 0 0 / 0.55), 0 4px 10px oklch(0 0 0 / 0.4)',
  },
  font,
};

globalStyle(':root', { vars: assignVars(vars, light) });

globalStyle(':root:not([data-theme])', {
  '@media': {
    '(prefers-color-scheme: dark)': { vars: assignVars(vars, dark) },
  },
});

globalStyle(':root[data-theme="light"]', { vars: assignVars(vars, light) });
globalStyle(':root[data-theme="dark"]', { vars: assignVars(vars, dark) });
