/**
 * Select primitive styles — a Base UI `Select` assembly styled from the
 * grayscale design tokens.
 *
 * The trigger looks like a compact input; the popup is a rounded panel with
 * highlighted/selected item states.
 */
import { primitiveStyle, transitionFast } from '$/design/primitive-layer';
import { focusRing, vars } from '$/design/theme.css';

/** See {@link vars.zIndex.popover} for why the z-index sits on the positioner. */
export const positioner = primitiveStyle({ zIndex: vars.zIndex.popover });

export const trigger = primitiveStyle({
  height: 34,
  border: `1px solid ${vars.color.border.default}`,
  background: vars.color.surface.card,
  borderRadius: vars.radius.sm,
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['3'],
  padding: `0 ${vars.space['4']}`,
  fontSize: vars.text.sm,
  color: vars.color.text.strong,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  fontFamily: 'inherit',
  width: '100%',
  transition: transitionFast('border-color', 'box-shadow'),
  selectors: {
    '&:hover:not(:disabled)': { borderColor: vars.color.border.strong },
    '&:focus-visible': { ...focusRing, borderColor: vars.color.border.focus },
    '&:disabled': { cursor: 'default', opacity: 0.6 },
  },
});

export const caret = primitiveStyle({
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  color: vars.color.text.subtle,
});

export const popup = primitiveStyle({
  background: vars.color.surface.card,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.lg,
  padding: vars.space['3'],
  minWidth: 160,
  maxHeight: 260,
  overflow: 'auto',
});

export const item = primitiveStyle({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['4'],
  padding: `${vars.space['3']} ${vars.space['4']}`,
  borderRadius: vars.radius.sm,
  fontSize: vars.text.sm,
  color: vars.color.text.body,
  cursor: 'pointer',
  userSelect: 'none',
  outline: 'none',
  selectors: {
    '&[data-highlighted]': { background: vars.color.surface.hover },
    '&[data-selected]': { color: vars.color.brand.base, fontWeight: vars.weight.semibold },
  },
});
