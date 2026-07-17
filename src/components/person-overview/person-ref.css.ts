import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

/**
 * Layout for {@link ./person-ref}'s chrome-less avatar + name (+ dates) row,
 * in its two shapes: stacked (dates under the name) and dense (dates inline
 * after the name, for compact grids).
 */

export const row = style({ display: 'flex', alignItems: 'center', gap: vars.space['3'] });
export const rowDense = style({ display: 'flex', alignItems: 'center', gap: vars.space['2'] });

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  minWidth: 0,
});
export const bodyDense = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'baseline',
  gap: vars.space['2'],
  minWidth: 0,
});
