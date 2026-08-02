import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

export const wrap = style({
  display: 'flex',
  justifyContent: 'center',
  padding: vars.space['8'],
});
