/**
 * Switch styles — the toggle track and thumb from the Person editor,
 * promoted to a shared primitive (ADR-0015).
 */
import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

const focusRing = {
  outline: `2px solid ${vars.color.accent}`,
  outlineOffset: 2,
} as const;

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
  top: 2,
  left: 2,
  width: 18,
  height: 18,
  borderRadius: '50%',
  background: '#fff',
  boxShadow: vars.shadow.sm,
  transition: 'left .15s',
  selectors: { [`${root}[data-checked] &`]: { left: 18 } },
});
