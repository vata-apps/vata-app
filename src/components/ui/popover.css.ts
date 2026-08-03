/**
 * Popover primitive styles — a Base UI `Popover` assembly styled from the
 * grayscale design tokens.
 *
 * Provides a positioned popup shell that floats above the Dialog primitive's
 * popup. Width and internal layout are left to the caller.
 */
import { primitiveStyle } from '$/design/primitive-layer';
import { vars } from '$/design/theme.css';

/**
 * See {@link vars.zIndex.popover} for why the z-index sits on the positioner.
 *
 * `[data-closed]` must hide the positioner explicitly: Base UI keeps it
 * mounted through its close transition (for exit-animation support) and
 * only relies on CSS to hide it — without an animation defined here, an
 * unhidden closed popup would stay on screen (inert, `pointer-events: none`)
 * until React unmounts it, or forever if it never does.
 */
export const positioner = primitiveStyle({
  zIndex: vars.zIndex.popover,
  selectors: {
    '&[data-closed]': { display: 'none' },
  },
});

export const popup = primitiveStyle({
  background: vars.color.surface.card,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.lg,
  padding: vars.space['4'],
});
