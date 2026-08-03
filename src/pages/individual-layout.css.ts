import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

/** Layout for the Individual shell: the people rail beside the identity header, tab bar, and routed body. */

export const shell = style({
  display: 'flex',
  flexDirection: 'row',
  height: '100%',
  minHeight: 0,
  overflow: 'hidden',
});

export const main = style({
  flex: '1 1 auto',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const content = style({
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['6'],
  padding: vars.space['6'],
  paddingBottom: 0,
});

export const outlet = style({
  flex: '1 1 auto',
  minHeight: 0,
  overflow: 'auto',
  padding: vars.space['6'],
});
