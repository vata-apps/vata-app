/**
 * Select primitive styles — a Base UI `Select` assembly styled from the
 * warm-earth tokens.
 *
 * The trigger looks like a compact input; the popup is a rounded panel over
 * `panel2` with highlighted/selected item states.
 */
import { primitiveStyle } from '$/design/primitive-layer';
import { focusRing, vars } from '$/design/theme.css';

/** See {@link vars.zIndex.popover} for why the z-index sits on the positioner. */
export const positioner = primitiveStyle({ zIndex: vars.zIndex.popover });

export const trigger = primitiveStyle({
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

export const caret = primitiveStyle({
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  color: vars.color.faint,
});

export const popup = primitiveStyle({
  background: vars.color.panel2,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: 11,
  boxShadow: vars.shadow.lg,
  padding: vars.space['1.5'],
  minWidth: 160,
  maxHeight: 260,
  overflow: 'auto',
});

export const item = primitiveStyle({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['2'],
  padding: `${vars.space['1.75']} ${vars.space['2.25']}`,
  borderRadius: vars.radius.sm,
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
