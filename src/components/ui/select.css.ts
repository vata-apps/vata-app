/**
 * Select styles — trigger, popup, and item atoms for the Base UI Select
 * primitive (ADR-0015). Consumed by the Select compound component; not
 * exported for direct use.
 */
import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

const focusRing = {
  outline: `2px solid ${vars.color.accent}`,
  outlineOffset: 2,
} as const;

export const trigger = style({
  height: 34,
  border: `1px solid ${vars.color.borderStrong}`,
  background: vars.color.panel,
  borderRadius: vars.radius.sm,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '0 10px',
  fontSize: 12.5,
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

export const caret = style({ marginLeft: 'auto', fontSize: 9, color: vars.color.faint });

/**
 * Z-index for Base UI positioner wrappers (Select + Popover). Floating UI
 * sets `will-change: transform` inline, creating a stacking context — the
 * positioner needs an explicit z-index above the dialog (101) so the popup
 * escapes it, but below the discard AlertDialog (110/111).
 */
export const positionerZ = style({ zIndex: 105 });

export const popup = style({
  background: vars.color.panel2,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: 11,
  boxShadow: vars.shadow.lg,
  padding: 6,
  minWidth: 160,
  maxHeight: 260,
  overflow: 'auto',
});

export const item = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '7px 9px',
  borderRadius: 7,
  fontSize: 13,
  color: vars.color.text,
  cursor: 'pointer',
  userSelect: 'none',
  outline: 'none',
  selectors: {
    '&[data-highlighted]': { background: vars.color.subtle },
    '&[data-selected]': { color: vars.color.accent, fontWeight: 600 },
  },
});
