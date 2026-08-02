/**
 * Switch primitive styles — a Base UI `Switch` assembly styled as a rounded
 * toggle with a sliding thumb.
 *
 * The root fills with `brand.base` when checked; the thumb is a circle that
 * slides horizontally — `text.onBrand` while checked, so it stays legible
 * against the near-white checked track in dark mode.
 */
import { primitiveStyle } from '$/design/primitive-layer';
import { focusRing, vars } from '$/design/theme.css';

export const root = primitiveStyle({
  width: 38,
  height: 22,
  borderRadius: 99,
  background: vars.color.border.default,
  position: 'relative',
  flex: '0 0 auto',
  cursor: 'pointer',
  border: 'none',
  padding: 0,
  selectors: {
    '&[data-checked]': { background: vars.color.brand.base },
    '&:focus-visible': focusRing,
    '&:disabled': { cursor: 'default', opacity: 0.6 },
  },
});

export const thumb = primitiveStyle({
  position: 'absolute',
  top: vars.space['1'],
  left: vars.space['1'],
  width: 18,
  height: 18,
  borderRadius: '50%',
  background: '#fff',
  boxShadow: vars.shadow.sm,
  transition: 'left .15s',
  selectors: { [`${root}[data-checked] &`]: { left: 18, background: vars.color.text.onBrand } },
});
