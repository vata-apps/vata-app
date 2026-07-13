/**
 * IconButton primitive styles — a square, icon-only button used for compact
 * actions such as removing a row or closing a dialog.
 *
 * Lifted from the Person editor's `iconbtn` atom; the hover turns danger-red
 * so the control reads as destructive/negative without taking up the width of
 * a text button.
 */
import { primitiveStyle } from '$/design/primitive-layer';
import { focusRing, vars } from '$/design/theme.css';

export const iconButton = primitiveStyle({
  width: 30,
  height: 30,
  borderRadius: 6,
  border: '1px solid transparent',
  background: 'transparent',
  color: vars.color.faint,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 auto',
  selectors: {
    '&:hover': { background: vars.color.subtle, color: vars.color.danger },
    '&:focus-visible': focusRing,
    '&:disabled': { cursor: 'default', opacity: 0.5 },
  },
});
