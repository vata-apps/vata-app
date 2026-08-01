/**
 * IconButton primitive styles — a square, icon-only button used for compact
 * actions such as editing a record, closing a dialog, or removing a row.
 */
import { primitiveStyle, transitionFast } from '$/design/primitive-layer';
import { focusRing, vars } from '$/design/theme.css';

export const iconButton = primitiveStyle({
  width: 32,
  height: 32,
  borderRadius: vars.radius.sm,
  border: '1px solid transparent',
  background: 'transparent',
  color: vars.color.text.muted,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 auto',
  transition: transitionFast('background', 'color'),
  selectors: {
    '&:hover:not(:disabled)': {
      background: vars.color.surface.hover,
      color: vars.color.text.strong,
    },
    '&:active:not(:disabled)': { background: vars.color.surface.active },
    '&:focus-visible': focusRing,
    '&:disabled': { cursor: 'default', opacity: 0.4 },
  },
});
