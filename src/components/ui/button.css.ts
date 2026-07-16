/**
 * Button primitive styles. Four variants lifted from the Person editor:
 * solid (primary), ghost (secondary), danger (destructive), dashed (add-row).
 *
 * Variants are declared with `recipe()` so the variant map lives beside the
 * styles it selects (ADR-0007).
 */
import { recipe } from '@vanilla-extract/recipes';

import { primitive } from '$/design/primitive-layer';
import { focusRing, vars } from '$/design/theme.css';

export const button = recipe({
  base: primitive({
    height: 34,
    borderRadius: vars.radius.sm,
    padding: `0 ${vars.space['4']}`,
    fontSize: vars.text['13'].fontSize,
    lineHeight: vars.text['13'].lineHeight,
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid transparent',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vars.space['2'],
    fontFamily: 'inherit',
    selectors: {
      '&:focus-visible': focusRing,
      '&:disabled': { cursor: 'default', opacity: 0.6 },
    },
  }),
  variants: {
    variant: {
      solid: primitive({
        background: vars.color.accent,
        color: vars.color.accentText,
        selectors: {
          '&:hover:not(:disabled)': { background: vars.color.accentHover },
        },
      }),
      ghost: primitive({
        background: 'transparent',
        color: vars.color.muted,
        selectors: {
          '&:hover:not(:disabled)': { color: vars.color.text },
        },
      }),
      danger: primitive({
        background: vars.color.danger,
        color: vars.color.accentText,
        selectors: {
          '&:hover:not(:disabled)': { filter: 'brightness(0.94)' },
        },
      }),
      dashed: primitive({
        alignSelf: 'flex-start',
        background: 'transparent',
        border: `1px dashed ${vars.color.borderStrong}`,
        color: vars.color.muted,
        padding: `0 ${vars.space['3']}`,
        fontSize: vars.text['12.5'].fontSize,
        lineHeight: vars.text['12.5'].lineHeight,
        selectors: {
          '&:hover:not(:disabled)': {
            borderColor: vars.color.accent,
            color: vars.color.accent,
          },
        },
      }),
    },
  },
  defaultVariants: {
    variant: 'solid',
  },
});
