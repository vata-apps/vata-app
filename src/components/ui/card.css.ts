/**
 * Card primitive styles — shared panel chrome for entity-detail sections.
 *
 * Two layouts, selected by variant rather than by overriding one with the
 * other:
 *
 * - `box` (default) — a padded card the consumer fills freely.
 * - `sectioned` — the card hands its padding to a {@link head} strip above
 *   hairline-separated {@link row}s that run edge to edge. This is the
 *   recurring panel shape across the person screen (Parents, Names, Media,
 *   Key events, Places), declared once here so every panel shares one
 *   hairline, one row rhythm, and one header baseline.
 */
import { recipe } from '@vanilla-extract/recipes';

import { primitive, primitiveStyle } from '$/design/primitive-layer';
import { vars } from '$/design/theme.css';

/**
 * Inline padding of a sectioned card's head and rows. Named so anything that
 * has to line up with them (the Places map inset) derives it instead of
 * restating the token and silently drifting.
 */
export const inlinePadding = vars.space['6'];

export const card = recipe({
  base: primitive({
    background: vars.color.surface.card,
    border: `1px solid ${vars.color.border.default}`,
    borderRadius: vars.radius.md,
    boxShadow: vars.shadow.sm,
  }),
  variants: {
    layout: {
      box: primitive({ padding: vars.space['6'] }),
      sectioned: primitive({ padding: 0 }),
    },
  },
  defaultVariants: { layout: 'box' },
});

export const head = primitiveStyle({
  display: 'flex',
  alignItems: 'baseline',
  flexWrap: 'wrap',
  gap: vars.space['4'],
  padding: `${vars.space['5']} ${inlinePadding} ${vars.space['4']}`,
});

export const row = primitiveStyle({
  padding: `${vars.space['5']} ${inlinePadding}`,
  borderTop: `1px solid ${vars.color.border.subtle}`,
});
