/**
 * Vata design tokens — the single source of visual truth (ADR-0005).
 *
 * A typed, zero-runtime Vanilla Extract contract. Every styled component reads
 * `vars.*`; raw color/size values live ONLY here. Grayscale identity: no hue
 * anywhere in the product — contrast and weight carry meaning instead. Spectral
 * (serif) is reserved for person names, drafts and empty states; IBM Plex Sans
 * is the UI/body face; IBM Plex Mono is for structured data (dates, ids,
 * coordinates, counts).
 *
 * Ported from the "Vata Design System" Claude Design project, itself derived
 * from the "Personnes" reference mockup — that mockup is the ultimate source
 * of truth. Lean by intent (ADR-0005): the contract holds what the product
 * uses today and grows as screens demand it.
 *
 * Light is the default on `:root`; dark applies via `:root[data-theme="dark"]`
 * (set from the resolved app appearance) and, as a fallback, via
 * `prefers-color-scheme` when no attribute is present.
 */
import {
  assignVars,
  createGlobalThemeContract,
  globalLayer,
  globalStyle,
} from '@vanilla-extract/css';

/**
 * Cascade layer holding every `src/components/ui/` primitive's chrome.
 *
 * Layered declarations always lose to unlayered ones, whatever the source
 * order. Feature stylesheets stay unlayered, so passing `className` to a
 * primitive reliably overrides it instead of depending on which `.css.ts` the
 * bundler happened to emit first.
 */
export const primitiveLayer = globalLayer('vata-primitives');

export const vars = createGlobalThemeContract(
  {
    color: {
      /** Surfaces, from the workspace up to a floating panel. */
      surface: {
        /** Workspace behind cards, expanded row bodies, drafts. */
        app: null,
        /** Cards, popovers, menus, inputs. */
        card: null,
        /** Left rails and list panes — a hair off the app ground. */
        panel: null,
        sunken: null,
        hover: null,
        active: null,
      },
      text: {
        /** Card and section titles (paired with `weight.strong`). */
        strong: null,
        /** Default body/UI ink. */
        body: null,
        /** Secondary text, labels. */
        muted: null,
        /** Placeholders, hints, tertiary text. */
        subtle: null,
        /** Text/glyphs on a `brand` fill. */
        onBrand: null,
      },
      border: {
        /** Dividers inside a card. */
        subtle: null,
        /** Card and input outlines. */
        default: null,
        /** Hover, and the dashed "empty slot" / "not saved yet" outline. */
        strong: null,
        focus: null,
      },
      /**
       * Not a color — the darkest ink. Marks links, focus, selected rows and
       * icon pucks. See `readme.md` in the source design system.
       */
      brand: {
        base: null,
        hover: null,
        active: null,
        subtleBg: null,
        subtleBorder: null,
      },
      /** Focus halo: pair with a `border.focus` outline, per the source system. */
      ring: null,
      /** Dialog/alert backdrop. */
      scrim: null,
      /**
       * Grayscale status tones — fill and weight distinguish them, never hue.
       * Always pair with a text label; never rely on shade alone.
       */
      status: {
        warn: { fg: null, bg: null },
        /** `err` is the most severe treatment: solid ink fill, white text. */
        err: { fg: null, bg: null, text: null },
      },
    },
    radius: { sm: null, md: null, lg: null, xl: null, full: null },
    shadow: { sm: null, lg: null, xl: null },
    motion: {
      ease: { standard: null },
      duration: { instant: null, fast: null },
    },
    font: { sans: null, serif: null, mono: null },
    /**
     * Type scale is closed — no half-steps. Round to the nearest token, never
     * smaller than `2xs`. Line height, weight and tracking are separate scales
     * combined per component, not paired per size.
     */
    text: {
      '2xs': null,
      xs: null,
      sm: null,
      md: null,
      lg: null,
      xl: null,
      '2xl': null,
      '3xl': null,
      '4xl': null,
      '5xl': null,
    },
    /** `none` is the single-line reset for compact controls (buttons, badges, segments). */
    leading: { none: null, tight: null, snug: null, normal: null },
    /** `strong` is the card/section title weight — heavier than `semibold`, short of `bold`. */
    weight: { regular: null, medium: null, semibold: null, strong: null, bold: null },
    tracking: { wide: null, caps: null },
    /**
     * Stacking order for portalled surfaces. Primitives read these; features
     * never declare a raw z-index.
     *
     * The scale is flat, so it models exactly one level of nesting: a select
     * or popover opened from a dialog floats above it, and a confirmation
     * alert covers both. A popover opened from *inside* an alert would fall
     * behind it — grow the scale into a per-depth model on the day a screen
     * needs that, rather than pretending it already works.
     *
     * `popover` sits on the Floating UI positioner, not the popup: the
     * positioner carries an inline `will-change: transform`, which creates a
     * stacking context that traps any z-index set on the popup inside it.
     */
    zIndex: {
      dialogBackdrop: null,
      dialog: null,
      popover: null,
      alertBackdrop: null,
      alert: null,
    },
    /**
     * 4px-based spacing scale. Only steps currently consumed by the product
     * are declared.
     */
    space: {
      '1': null,
      '2': null,
      '3': null,
      '4': null,
      '5': null,
      '6': null,
      '7': null,
      '8': null,
    },
  },
  (_value, path) =>
    `vata-${path
      .map((segment) =>
        // CSS custom property identifiers cannot contain a leading digit or a
        // period; escape them so numeric token steps (e.g. text.2xl) remain
        // valid variables.
        segment.replace(/\.|^\d/g, (match) => (match === '.' ? '_' : `_${match}`))
      )
      .join('-')}`
);

/**
 * The one focus treatment: a halo plus a darker border. Spread the halo into
 * a `:focus-visible` selector and pair it with `border: vars.color.border.focus`
 * on the control; every focusable control in the app wears the same one.
 */
export const focusRing = {
  outline: 'none',
  boxShadow: `0 0 0 3px ${vars.color.ring}`,
} as const;

const font = {
  sans: `'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif`,
  serif: `'Spectral', 'Iowan Old Style', Georgia, serif`,
  mono: `'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace`,
};

const radius = { sm: '5px', md: '8px', lg: '12px', xl: '16px', full: '999px' };

const motion = {
  ease: { standard: 'cubic-bezier(0.2, 0, 0, 1)' },
  duration: { instant: '80ms', fast: '140ms' },
};

const text = {
  '2xs': '11px',
  xs: '12px',
  sm: '13px',
  md: '14px',
  lg: '16px',
  xl: '18px',
  '2xl': '22px',
  '3xl': '28px',
  '4xl': '36px',
  '5xl': '46px',
};

const leading = { none: '1', tight: '1.15', snug: '1.3', normal: '1.5' };

const weight = { regular: '400', medium: '500', semibold: '600', strong: '650', bold: '700' };

const tracking = { wide: '0.02em', caps: '0.04em' };

const zIndex = {
  dialogBackdrop: '100',
  dialog: '101',
  popover: '105',
  alertBackdrop: '110',
  alert: '111',
};

const space = {
  '1': '2px',
  '2': '4px',
  '3': '6px',
  '4': '8px',
  '5': '12px',
  '6': '16px',
  '7': '20px',
  '8': '24px',
};

// Neutral gray ramp (light). One scale, zero chroma — every color below is a
// reference into this ramp at a different lightness.
const neutral = {
  0: '#ffffff',
  25: 'oklch(0.99 0 0)',
  50: 'oklch(0.975 0 0)',
  100: 'oklch(0.95 0 0)',
  200: 'oklch(0.905 0 0)',
  300: 'oklch(0.83 0 0)',
  400: 'oklch(0.65 0 0)',
  500: 'oklch(0.50 0 0)',
  600: 'oklch(0.40 0 0)',
  700: 'oklch(0.305 0 0)',
  800: 'oklch(0.22 0 0)',
  900: 'oklch(0.145 0 0)',
};

const light = {
  color: {
    surface: {
      app: neutral[50],
      card: neutral[0],
      panel: neutral[25],
      sunken: neutral[100],
      hover: neutral[100],
      active: neutral[200],
    },
    text: {
      strong: neutral[900],
      body: neutral[800],
      muted: neutral[600],
      subtle: neutral[500],
      onBrand: '#ffffff',
    },
    border: {
      subtle: neutral[200],
      default: neutral[300],
      strong: neutral[400],
      focus: neutral[700],
    },
    brand: {
      base: neutral[800],
      hover: neutral[900],
      active: '#000000',
      subtleBg: neutral[100],
      subtleBorder: neutral[300],
    },
    ring: `color-mix(in srgb, ${neutral[500]} 45%, transparent)`,
    // No scrim token ships in the source system; derived from the darkest
    // neutral to stay hue-free, same role as the old warm-tinted scrim.
    scrim: `oklch(0.145 0 0 / 0.55)`,
    status: {
      warn: { fg: neutral[900], bg: neutral[200] },
      err: { fg: '#ffffff', bg: neutral[900], text: neutral[900] },
    },
  },
  radius,
  shadow: {
    sm: '0 1px 2px rgba(36, 33, 28, 0.06), 0 1px 1px rgba(36, 33, 28, 0.04)',
    lg: '0 8px 24px rgba(36, 33, 28, 0.12), 0 2px 6px rgba(36, 33, 28, 0.08)',
    xl: '0 18px 48px rgba(36, 33, 28, 0.18), 0 6px 14px rgba(36, 33, 28, 0.10)',
  },
  motion,
  font,
  text,
  leading,
  weight,
  tracking,
  zIndex,
  space,
};

const dark = {
  color: {
    surface: {
      app: 'oklch(0.155 0 0)',
      card: 'oklch(0.195 0 0)',
      panel: 'oklch(0.175 0 0)',
      sunken: 'oklch(0.145 0 0)',
      hover: 'oklch(0.245 0 0)',
      active: 'oklch(0.285 0 0)',
    },
    text: {
      strong: 'oklch(0.97 0 0)',
      body: 'oklch(0.92 0 0)',
      muted: 'oklch(0.74 0 0)',
      subtle: 'oklch(0.62 0 0)',
      onBrand: 'oklch(0.145 0 0)',
    },
    border: {
      subtle: 'oklch(0.27 0 0)',
      default: 'oklch(0.33 0 0)',
      strong: 'oklch(0.44 0 0)',
      focus: 'oklch(0.85 0 0)',
    },
    brand: {
      base: 'oklch(0.92 0 0)',
      hover: 'oklch(0.97 0 0)',
      active: '#ffffff',
      subtleBg: 'oklch(0.285 0 0)',
      subtleBorder: 'oklch(0.40 0 0)',
    },
    ring: 'color-mix(in srgb, oklch(0.85 0 0) 40%, transparent)',
    scrim: 'oklch(0 0 0 / 0.70)',
    status: {
      warn: { fg: 'oklch(0.98 0 0)', bg: 'oklch(0.34 0 0)' },
      err: { fg: 'oklch(0.145 0 0)', bg: 'oklch(0.90 0 0)', text: 'oklch(0.96 0 0)' },
    },
  },
  radius,
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.40), 0 1px 1px rgba(0, 0, 0, 0.30)',
    lg: '0 10px 28px rgba(0, 0, 0, 0.55), 0 2px 6px rgba(0, 0, 0, 0.40)',
    xl: '0 20px 56px rgba(0, 0, 0, 0.65), 0 6px 14px rgba(0, 0, 0, 0.45)',
  },
  motion,
  font,
  text,
  leading,
  weight,
  tracking,
  zIndex,
  space,
};

globalStyle(':root', { vars: assignVars(vars, light) });

// The app font lives on `.radix-themes`, but Base UI surfaces (select popups,
// dialogs) portal to <body>, outside that scope, and would fall back to the
// UA serif default. Anchor the sans stack on <body> so every portalled surface
// inherits it; `.radix-themes` still wins inside the main tree by specificity.
globalStyle('body', { fontFamily: vars.font.sans });

globalStyle(':root:not([data-theme])', {
  '@media': {
    '(prefers-color-scheme: dark)': { vars: assignVars(vars, dark) },
  },
});

globalStyle(':root[data-theme="light"]', { vars: assignVars(vars, light) });
globalStyle(':root[data-theme="dark"]', { vars: assignVars(vars, dark), colorScheme: 'dark' });
