/**
 * Popover styles — positioner and popup chrome for Base UI Popover panels
 * (ADR-0015). Consumers add sizing (width, padding) via a `className` override
 * on `Popover.Popup`.
 */
import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

/**
 * Z-index for Base UI positioner wrappers. Floating UI sets `will-change:
 * transform` inline, which creates a stacking context — the positioner needs
 * an explicit z-index above the dialog (101) so the popup escapes it, but
 * below the discard AlertDialog (110/111).
 */
export const positionerZ = style({ zIndex: 105 });

/** Base chrome for a floating panel: surface, border, shadow, radius. */
export const popup = style({
  background: vars.color.panel,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: 11,
  boxShadow: vars.shadow.lg,
});
