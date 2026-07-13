/**
 * SegmentedControl primitive styles — a compact radio-group that looks like a
 * single pill with one raised active segment.
 *
 * Lifted from the Person editor's sex selector; variants declared with
 * `recipe()` beside the styles they select (ADR-0015).
 */
import { recipe } from '@vanilla-extract/recipes';
import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

const focusRing = {
  outline: `2px solid ${vars.color.accent}`,
  outlineOffset: 2,
};

export const track = style({
  display: 'inline-flex',
  background: vars.color.subtle,
  borderRadius: 8,
  padding: vars.space['0.75'],
  gap: vars.space['0.5'],
  width: 'max-content',
});

export const item = recipe({
  base: {
    padding: `${vars.space['1.5']} ${vars.space['3.25']}`,
    borderRadius: 6,
    fontSize: vars.text['12.5'].fontSize,
    lineHeight: vars.text['12.5'].lineHeight,
    fontWeight: 600,
    color: vars.color.muted,
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    fontFamily: 'inherit',
    selectors: {
      '&:disabled': { cursor: 'default', opacity: 0.6 },
      '&:focus-visible': focusRing,
    },
  },
  variants: {
    active: {
      false: {},
      true: {
        background: vars.color.panel,
        color: vars.color.text,
        boxShadow: vars.shadow.sm,
      },
    },
  },
  defaultVariants: {
    active: false,
  },
});
