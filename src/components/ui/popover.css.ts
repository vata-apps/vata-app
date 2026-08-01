/**
 * Popover primitive styles — a Base UI `Popover` assembly styled from the
 * grayscale design tokens.
 *
 * Provides a positioned popup shell that floats above the Dialog primitive's
 * popup. Width and internal layout are left to the caller.
 */
import { primitiveStyle } from '$/design/primitive-layer';
import { vars } from '$/design/theme.css';

/** See {@link vars.zIndex.popover} for why the z-index sits on the positioner. */
export const positioner = primitiveStyle({ zIndex: vars.zIndex.popover });

export const popup = primitiveStyle({
  background: vars.color.surface.card,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.lg,
  padding: vars.space['4'],
});
