import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

/** Layout for the Individual shell: identity header, tab bar, and the routed body. */

export const page = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['4'],
  padding: vars.space['4'],
});

export const body = style({ display: 'flex', flexDirection: 'column', gap: vars.space['4'] });
