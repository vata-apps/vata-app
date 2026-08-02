import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

export const rail = style({ display: 'flex', flexDirection: 'column', gap: vars.space['6'] });

export const missingSlot = style({ display: 'flex', alignItems: 'center', gap: vars.space['4'] });

export const nameRow = style({ display: 'flex', flexDirection: 'column', gap: vars.space['3'] });

export const nameRowHead = style({ display: 'flex', alignItems: 'center', gap: vars.space['4'] });

export const mediaEmpty = style({
  padding: `${vars.space['7']} ${vars.space['5']}`,
  textAlign: 'center',
});
