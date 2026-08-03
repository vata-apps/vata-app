/**
 * IconButton primitive styles — a square, icon-only button used for compact
 * actions (editing a record, closing a dialog, removing a row) and, at the
 * `lg` size with `active`, a navigation-rail item.
 *
 * Variants are declared with `recipe()` so the variant map lives beside the
 * styles it selects (ADR-0005).
 */
import { recipe } from '@vanilla-extract/recipes';

import { primitive, transitionFast } from '$/design/primitive-layer';
import { focusRing, vars } from '$/design/theme.css';

export const iconButton = recipe({
  base: primitive({
    borderRadius: vars.radius.sm,
    border: '1px solid transparent',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    transition: transitionFast('background', 'color'),
    selectors: {
      '&:focus-visible': focusRing,
      '&:disabled': { cursor: 'default', opacity: 0.4 },
    },
  }),
  variants: {
    size: {
      md: primitive({ width: 32, height: 32 }),
      lg: primitive({ width: 38, height: 38 }),
    },
    active: {
      false: primitive({
        background: 'transparent',
        color: vars.color.text.muted,
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.color.surface.hover,
            color: vars.color.text.strong,
          },
          '&:active:not(:disabled)': { background: vars.color.surface.active },
        },
      }),
      true: primitive({
        background: vars.color.brand.base,
        color: vars.color.text.onBrand,
        selectors: {
          '&:hover:not(:disabled)': { background: vars.color.brand.hover },
          '&:active:not(:disabled)': { background: vars.color.brand.active },
        },
      }),
    },
  },
  defaultVariants: { size: 'md', active: false },
});
