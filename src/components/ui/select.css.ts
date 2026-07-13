/**
 * Select primitive styles — a Base UI `Select` assembly styled from the
 * warm-earth tokens.
 *
 * The trigger looks like a compact input; the popup is a rounded panel over
 * `panel2` with highlighted/selected item states.
 */
import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

export const positioner = style({
  /**
   * Floating UI sets `will-change: transform` on the positioner, which creates
   * a stacking context with `z-index: auto` and traps any z-index on the popup
   * inside. The positioner itself needs a z-index above the Dialog popup (101)
   * and below any confirmation AlertDialog (110) so the confirm prompt still
   * covers pickers.
   */
  zIndex: 105,
});

const focusRing = {
  outline: `2px solid ${vars.color.accent}`,
  outlineOffset: 2,
};

export const trigger = style({
  height: 34,
  border: `1px solid ${vars.color.borderStrong}`,
  background: vars.color.panel,
  borderRadius: vars.radius.sm,
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['1.5'],
  padding: `0 ${vars.space['2.5']}`,
  fontSize: vars.text['12.5'].fontSize,
  lineHeight: vars.text['12.5'].lineHeight,
  color: vars.color.text,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  fontFamily: 'inherit',
  width: '100%',
  selectors: {
    '&:hover': { borderColor: vars.color.faint },
    '&:focus-visible': focusRing,
    '&:disabled': { cursor: 'default', opacity: 0.6 },
  },
});

export const caret = style({
  marginLeft: 'auto',
  fontSize: 9,
  color: vars.color.faint,
});

export const popup = style({
  background: vars.color.panel2,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: 11,
  boxShadow: vars.shadow.lg,
  padding: vars.space['1.5'],
  minWidth: 160,
  maxHeight: 260,
  overflow: 'auto',
});

export const item = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['2'],
  padding: `7px 9px`,
  borderRadius: 7,
  fontSize: vars.text['13'].fontSize,
  lineHeight: vars.text['13'].lineHeight,
  color: vars.color.text,
  cursor: 'pointer',
  userSelect: 'none',
  outline: 'none',
  selectors: {
    '&[data-highlighted]': { background: vars.color.subtle },
    '&[data-selected]': { color: vars.color.accent, fontWeight: 600 },
  },
});
