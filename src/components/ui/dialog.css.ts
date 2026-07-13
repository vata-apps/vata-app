/**
 * Dialog primitive styles — a Base UI `Dialog` assembly styled from the
 * warm-earth tokens.
 *
 * Provides a scrim backdrop and a rounded popup shell. Layout concerns such as
 * headers, bodies, and footers are left to the caller as style atoms.
 */
import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

export const backdrop = style({
  position: 'fixed',
  inset: 0,
  zIndex: 100,
  background: vars.color.scrim,
});

export const popup = style({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 101,
  fontFamily: vars.font.sans,
  color: vars.color.text,
  background: vars.color.panel,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: 14,
  boxShadow: vars.shadow.lg,
});
