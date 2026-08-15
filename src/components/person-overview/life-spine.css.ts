import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

/** Diameter of a milestone's kind puck; also the indent the children block hangs from. */
const puckSize = 24;

export const milestoneRow = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['4'],
});

export const missingRow = style({ display: 'flex', alignItems: 'center', gap: vars.space['4'] });

/** Kind marker leading a milestone row: a ringed puck holding the event glyph. */
export const kindPuck = style({
  width: puckSize,
  height: puckSize,
  flexShrink: 0,
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.full,
  background: vars.color.brand.subtleBg,
  border: `1px solid ${vars.color.brand.subtleBorder}`,
});

/** The unrecorded counterpart of a puck: a hollow ring, deliberately quiet. */
export const missingDot = style({
  width: 8,
  height: 8,
  flexShrink: 0,
  boxSizing: 'border-box',
  borderRadius: vars.radius.full,
  border: `1.5px solid ${vars.color.text.subtle}`,
});

export const head = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['5'],
  flexWrap: 'wrap',
});

export const spacer = style({ flex: 1 });

export const placeInline = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['3'],
  flexShrink: 0,
});

export const spouse = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['4'],
  flexShrink: 0,
});

/**
 * Nesting cue: a vertical spine + indent marks the children as subordinate to
 * their milestone. The indent clears the kind puck and its gap, so the block
 * hangs off the row's text column rather than its marker.
 */
export const childrenGroup = style({
  marginLeft: `calc(${puckSize}px + ${vars.space['5']})`,
  display: 'flex',
  gap: vars.space['5'],
  alignItems: 'stretch',
});

export const childrenSpine = style({ width: 2, background: vars.color.border.subtle });

export const childrenColumn = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['4'],
});

export const childrenList = style({
  display: 'flex',
  gap: vars.space['5'],
  flexWrap: 'wrap',
});
