import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

export const head = style({ display: 'flex', alignItems: 'center', gap: vars.space['2'] });

export const chips = style({ display: 'flex', gap: vars.space['3'], flexWrap: 'wrap' });

export const chip = style({ cursor: 'default' });

export const chipBody = style({ display: 'flex', flexDirection: 'column', gap: vars.space['1.5'] });
