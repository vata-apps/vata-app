import { style, styleVariants } from '@vanilla-extract/css';

import { transitionFast } from '$/design/primitive-layer';
import { focusRing, vars } from '$/design/theme.css';
import * as card from '../ui/card.css';

/** Styles for {@link ./record-row}: one selectable fact inside a list card. */

/**
 * Composed on `card.row` so a record row keeps the same hairline and padding
 * rhythm as every other row in a sectioned card; this adds only what makes it
 * a control (button reset, focus ring, hover transition).
 */
const rowBase = style([
  card.row,
  {
    display: 'flex',
    alignItems: 'center',
    gap: vars.space['5'],
    width: '100%',
    textAlign: 'left',
    font: 'inherit',
    color: vars.color.text.body,
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: 'none',
    cursor: 'pointer',
    transition: transitionFast('background'),
    selectors: {
      '&:focus-visible': focusRing,
    },
  },
]);

/**
 * A draft sits on the workspace ground rather than the card's own surface, so
 * an unsaved row reads as pending even before its dashed puck and badge are
 * scanned. Selection wins over both states.
 */
export const row = styleVariants({
  idle: [
    rowBase,
    {
      background: 'transparent',
      selectors: { '&:hover': { background: vars.color.surface.hover } },
    },
  ],
  draft: [rowBase, { background: vars.color.surface.app }],
  selected: [rowBase, { background: vars.color.brand.subtleBg }],
});

/** Round icon puck leading the row. */
const puckBase = style({
  width: 34,
  height: 34,
  borderRadius: vars.radius.full,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  boxSizing: 'border-box',
});

export const puck = styleVariants({
  saved: [
    puckBase,
    {
      background: vars.color.brand.subtleBg,
      color: vars.color.brand.base,
      border: `1px solid ${vars.color.brand.subtleBorder}`,
    },
  ],
  /** Dashed and unfilled — the same "empty slot" language as an add affordance. */
  draft: [
    puckBase,
    {
      background: 'transparent',
      color: vars.color.text.subtle,
      border: `1px dashed ${vars.color.border.strong}`,
    },
  ],
});

export const content = style({
  minWidth: 0,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
});

export const titleLine = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: vars.space['4'],
  rowGap: vars.space['1'],
  flexWrap: 'wrap',
});

export const title = style({
  fontSize: vars.text.md,
  fontWeight: vars.weight.semibold,
  lineHeight: vars.leading.tight,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const meta = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['4'],
  minWidth: 0,
});

/** Source-count chip: the glyph, then the number. */
export const sourceCount = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontFamily: vars.font.mono,
  fontSize: vars.text.xs,
  flexShrink: 0,
});

export const draftBadge = style({
  borderStyle: 'dashed',
  borderColor: vars.color.border.strong,
  background: 'transparent',
  textTransform: 'uppercase',
  letterSpacing: vars.tracking.caps,
});

/** Inks up on the selected row, so the open record is legible at a glance. */
export const chevron = styleVariants({
  idle: [{ flexShrink: 0, color: vars.color.text.subtle }],
  selected: [{ flexShrink: 0, color: vars.color.brand.base }],
});
