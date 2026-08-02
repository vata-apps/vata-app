/**
 * Tooltip primitive styles — a Base UI `Tooltip` assembly styled from the
 * grayscale design tokens.
 */
import { primitiveStyle } from '$/design/primitive-layer';
import { vars } from '$/design/theme.css';

/**
 * See {@link vars.zIndex.popover} for why the z-index sits on the positioner.
 *
 * `[data-closed]` must hide the positioner explicitly: Base UI keeps it
 * mounted through its close transition (for exit-animation support) and
 * only relies on CSS to hide it — without an animation defined here, an
 * unhidden closed tooltip would stay on screen (inert, `pointer-events: none`)
 * after the pointer leaves, instead of disappearing.
 */
export const positioner = primitiveStyle({
  zIndex: vars.zIndex.popover,
  selectors: {
    '&[data-closed]': { display: 'none' },
  },
});

export const popup = primitiveStyle({
  background: vars.color.brand.base,
  color: vars.color.text.onBrand,
  borderRadius: vars.radius.sm,
  boxShadow: vars.shadow.sm,
  padding: `${vars.space['1']} ${vars.space['4']}`,
  fontSize: vars.text.xs,
  lineHeight: vars.leading.snug,
  whiteSpace: 'nowrap',
});
