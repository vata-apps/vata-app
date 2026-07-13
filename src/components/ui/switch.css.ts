/**
 * Switch primitive styles — a Base UI `Switch` assembly styled as a rounded
 * toggle with a sliding thumb.
 *
 * The root fills with the accent color when checked; the thumb is a white
 * circle that slides horizontally.
 */
import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

const focusRing = {
  outline: `2px solid ${vars.color.accent}`,
  outlineOffset: 2,
};

export const root = style({
  width: 38,
  height: 22,
  borderRadius: 99,
  background: vars.color.borderStrong,
  position: 'relative',
  flex: '0 0 auto',
  cursor: 'pointer',
  border: 'none',
  padding: 0,
  selectors: {
    '&[data-checked]': { background: vars.color.accent },
    '&:focus-visible': focusRing,
    '&:disabled': { cursor: 'default', opacity: 0.6 },
  },
});

export const thumb = style({
  position: 'absolute',
  top: vars.space['0.5'],
  left: vars.space['0.5'],
  width: 18,
  height: 18,
  borderRadius: '50%',
  background: '#fff',
  boxShadow: vars.shadow.sm,
  transition: 'left .15s',
  selectors: { [`${root}[data-checked] &`]: { left: 18 } },
});
