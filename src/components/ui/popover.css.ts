/**
 * Popover primitive styles — a Base UI `Popover` assembly styled from the
 * warm-earth tokens.
 *
 * Provides a positioned popup shell with a z-index high enough to float above
 * the Dialog primitive's popup. Width and internal layout are left to the
 * caller.
 */
import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

export const positioner = style({
  /**
   * Floating UI sets `will-change: transform` on the positioner, which creates
   * a stacking context with `z-index: auto` and traps any z-index on the popup
   * inside. The positioner itself needs a z-index above the Dialog popup (101)
   * and below any confirmation AlertDialog (110/111) so the confirm prompt
   * still covers pickers.
   */
  zIndex: 105,
});

export const popup = style({
  background: vars.color.panel,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: 11,
  boxShadow: vars.shadow.lg,
  padding: vars.space['2.25'],
});
