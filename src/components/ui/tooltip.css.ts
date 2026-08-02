/**
 * Tooltip primitive styles — a Base UI `Tooltip` assembly styled from the
 * grayscale design tokens.
 */
import { primitiveStyle } from '$/design/primitive-layer';
import { vars } from '$/design/theme.css';

/** See {@link vars.zIndex.popover} for why the z-index sits on the positioner. */
export const positioner = primitiveStyle({ zIndex: vars.zIndex.popover });

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
