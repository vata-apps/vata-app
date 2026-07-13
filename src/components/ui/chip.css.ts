/**
 * Chip primitive — a compact, dismissible token that represents an active
 * filter or selection. Used by filter toolbars and similar dense surfaces.
 */
import { primitiveStyle } from '$/design/primitive-layer';
import { focusRing, vars } from '$/design/theme.css';

export const chip = primitiveStyle({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['1.5'],
  height: 28,
  padding: `0 ${vars.space['2']}`,
  background: vars.color.panel2,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: vars.radius.base,
  fontSize: vars.text['12.5'].fontSize,
  lineHeight: vars.text['12.5'].lineHeight,
  color: vars.color.text,
  whiteSpace: 'nowrap',
});

export const removeButton = primitiveStyle({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 16,
  height: 16,
  padding: 0,
  margin: 0,
  background: 'transparent',
  border: 'none',
  borderRadius: vars.radius.sm,
  color: vars.color.muted,
  cursor: 'pointer',
  selectors: {
    '&:hover': { color: vars.color.text },
    '&:focus-visible': focusRing,
  },
});
