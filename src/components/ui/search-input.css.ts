/**
 * SearchInput primitive styles — filter-as-you-type field for a list pane.
 */
import { primitiveStyle } from '$/design/primitive-layer';
import { focusRing, vars } from '$/design/theme.css';

export const root = primitiveStyle({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['4'],
  height: 32,
  padding: `0 ${vars.space['5']}`,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  background: vars.color.surface.card,
  boxSizing: 'border-box',
  color: vars.color.text.subtle,
  selectors: {
    '&:focus-within': { ...focusRing, borderColor: vars.color.border.focus },
  },
});

export const input = primitiveStyle({
  flex: 1,
  minWidth: 0,
  padding: 0,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontFamily: vars.font.sans,
  fontSize: vars.text.xs,
  color: vars.color.text.body,
  selectors: {
    '&::placeholder': { color: vars.color.text.subtle },
  },
});

export const clear = primitiveStyle({
  display: 'flex',
  border: 'none',
  background: 'none',
  padding: 0,
  cursor: 'pointer',
  color: vars.color.text.subtle,
  selectors: {
    '&:hover': { color: vars.color.text.body },
    '&:focus-visible': focusRing,
  },
});
