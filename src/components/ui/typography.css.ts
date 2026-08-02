/**
 * Typography primitive styles — a single polymorphic text component.
 *
 * Variants are declared with `recipe()` beside the styles they select
 * (ADR-0005). The semantic boundary between a "text" and a "heading" is
 * handled by the `as` prop, not by separate components.
 */
import { recipe } from '@vanilla-extract/recipes';

import { primitive } from '$/design/primitive-layer';
import { vars } from '$/design/theme.css';

export const typography = recipe({
  base: primitive({
    margin: 0,
    lineHeight: vars.leading.normal,
  }),
  variants: {
    size: {
      '2xs': primitive({ fontSize: vars.text['2xs'] }),
      xs: primitive({ fontSize: vars.text.xs }),
      sm: primitive({ fontSize: vars.text.sm }),
      md: primitive({ fontSize: vars.text.md }),
      lg: primitive({ fontSize: vars.text.lg }),
      xl: primitive({ fontSize: vars.text.xl }),
      '2xl': primitive({ fontSize: vars.text['2xl'] }),
      '3xl': primitive({ fontSize: vars.text['3xl'] }),
      '4xl': primitive({ fontSize: vars.text['4xl'] }),
      '5xl': primitive({ fontSize: vars.text['5xl'] }),
    },
    weight: {
      regular: primitive({ fontWeight: vars.weight.regular }),
      medium: primitive({ fontWeight: vars.weight.medium }),
      semibold: primitive({ fontWeight: vars.weight.semibold }),
      strong: primitive({ fontWeight: vars.weight.strong }),
      bold: primitive({ fontWeight: vars.weight.bold }),
    },
    tone: {
      body: primitive({ color: vars.color.text.body }),
      muted: primitive({ color: vars.color.text.muted }),
      subtle: primitive({ color: vars.color.text.subtle }),
      brand: primitive({ color: vars.color.brand.base }),
      danger: primitive({ color: vars.color.status.err.text }),
      warn: primitive({ color: vars.color.status.warn.fg }),
    },
    family: {
      sans: primitive({ fontFamily: vars.font.sans }),
      /** The lineage signature: serif is always italic — see `theme.css.ts`. */
      serif: primitive({ fontFamily: vars.font.serif, fontStyle: 'italic' }),
      mono: primitive({ fontFamily: vars.font.mono }),
    },
  },
  defaultVariants: {
    size: 'sm',
    weight: 'regular',
    tone: 'body',
    family: 'sans',
  },
});
