/**
 * Button primitive styles. Four variants lifted from the Person editor:
 * solid (primary), ghost (secondary), danger (destructive), dashed (add-row).
 *
 * Variants are declared with `recipe()` so the variant map lives beside the
 * styles it selects (ADR-0005).
 */
import { recipe } from '@vanilla-extract/recipes';

import { primitive, transitionFast } from '$/design/primitive-layer';
import { focusRing, vars } from '$/design/theme.css';

export const button = recipe({
  base: primitive({
    height: 34,
    borderRadius: vars.radius.sm,
    padding: `0 ${vars.space['6']}`,
    fontSize: vars.text.sm,
    lineHeight: vars.leading.none,
    fontWeight: vars.weight.medium,
    cursor: 'pointer',
    border: '1px solid transparent',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vars.space['4'],
    fontFamily: 'inherit',
    transition: transitionFast('background', 'border-color'),
    selectors: {
      '&:focus-visible': focusRing,
      '&:disabled': { cursor: 'default', opacity: 0.6 },
    },
  }),
  variants: {
    variant: {
      solid: primitive({
        background: vars.color.brand.base,
        color: vars.color.text.onBrand,
        selectors: {
          '&:hover:not(:disabled)': { background: vars.color.brand.hover },
          '&:active:not(:disabled)': { background: vars.color.brand.active },
        },
      }),
      ghost: primitive({
        background: 'transparent',
        color: vars.color.text.body,
        selectors: {
          '&:hover:not(:disabled)': { background: vars.color.surface.hover },
        },
      }),
      danger: primitive({
        background: vars.color.status.err.bg,
        color: vars.color.status.err.fg,
        selectors: {
          '&:hover:not(:disabled)': {
            background: `color-mix(in srgb, ${vars.color.status.err.bg} 85%, black)`,
          },
        },
      }),
      dashed: primitive({
        alignSelf: 'flex-start',
        background: 'transparent',
        border: `1px dashed ${vars.color.border.strong}`,
        color: vars.color.text.muted,
        padding: `0 ${vars.space['5']}`,
        fontSize: vars.text.xs,
        selectors: {
          '&:hover:not(:disabled)': {
            borderColor: vars.color.brand.base,
            color: vars.color.brand.base,
          },
        },
      }),
    },
  },
  defaultVariants: {
    variant: 'solid',
  },
});
