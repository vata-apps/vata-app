import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

export const row = style({ display: 'flex', flexDirection: 'column', gap: vars.space['1.5'] });

export const rowHead = style({ display: 'flex', alignItems: 'center', gap: vars.space['2'] });

export const rowBody = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: vars.space['2'],
  flexWrap: 'wrap',
});
