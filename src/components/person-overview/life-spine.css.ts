import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

export const row = style({ display: 'flex', flexDirection: 'column', gap: vars.space['2'] });

export const missingRow = style({ display: 'flex', alignItems: 'center', gap: vars.space['2'] });

export const head = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['3'],
  flexWrap: 'wrap',
});

export const spacer = style({ flex: 1 });

export const placeInline = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['1.5'],
  flexShrink: 0,
});

export const spouse = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['2'],
  flexShrink: 0,
});

/** Nesting cue: a vertical spine + indent marks the children as subordinate to their milestone. */
export const childrenGroup = style({
  marginLeft: vars.space['2'],
  display: 'flex',
  gap: vars.space['3'],
  alignItems: 'stretch',
});

export const childrenSpine = style({ width: 2, background: vars.color.border });

export const childrenColumn = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['2'],
});

export const childrenList = style({
  display: 'flex',
  gap: vars.space['3'],
  flexWrap: 'wrap',
});
