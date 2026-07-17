import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

export const rail = style({ display: 'flex', flexDirection: 'column', gap: vars.space['4'] });

export const missingSlot = style({ display: 'flex', alignItems: 'center', gap: vars.space['2'] });

export const nameRow = style({ display: 'flex', flexDirection: 'column', gap: vars.space['1.5'] });

export const nameRowHead = style({ display: 'flex', alignItems: 'center', gap: vars.space['2'] });

export const mediaEmpty = style({
  padding: `${vars.space['5']} ${vars.space['3']}`,
  textAlign: 'center',
});
