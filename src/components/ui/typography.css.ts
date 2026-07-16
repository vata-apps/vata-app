/**
 * Typography primitive styles — a single polymorphic text component.
 *
 * Variants are declared with `recipe()` beside the styles they select
 * (ADR-0007). The semantic boundary between a "text" and a "heading" is
 * handled by the `as` prop, not by separate components.
 */
import { recipe } from '@vanilla-extract/recipes';

import { primitive } from '$/design/primitive-layer';
import { vars } from '$/design/theme.css';

export const typography = recipe({
  base: primitive({
    margin: 0,
  }),
  variants: {
    size: {
      '12.5': primitive({
        fontSize: vars.text['12.5'].fontSize,
        lineHeight: vars.text['12.5'].lineHeight,
      }),
      '13': primitive({
        fontSize: vars.text['13'].fontSize,
        lineHeight: vars.text['13'].lineHeight,
      }),
      '13.5': primitive({
        fontSize: vars.text['13.5'].fontSize,
        lineHeight: vars.text['13.5'].lineHeight,
      }),
      '15': primitive({
        fontSize: vars.text['15'].fontSize,
        lineHeight: vars.text['15'].lineHeight,
      }),
      '16': primitive({
        fontSize: vars.text['16'].fontSize,
        lineHeight: vars.text['16'].lineHeight,
      }),
    },
    weight: {
      '400': primitive({ fontWeight: 400 }),
      '500': primitive({ fontWeight: 500 }),
      '550': primitive({ fontWeight: 550 }),
      '600': primitive({ fontWeight: 600 }),
      '650': primitive({ fontWeight: 650 }),
      '700': primitive({ fontWeight: 700 }),
    },
    tone: {
      text: primitive({ color: vars.color.text }),
      muted: primitive({ color: vars.color.muted }),
      faint: primitive({ color: vars.color.faint }),
      accent: primitive({ color: vars.color.accent }),
      danger: primitive({ color: vars.color.danger }),
      warn: primitive({ color: vars.color.warn }),
    },
    family: {
      sans: primitive({ fontFamily: vars.font.sans }),
      serif: primitive({ fontFamily: vars.font.serif }),
      mono: primitive({ fontFamily: vars.font.mono }),
    },
  },
  defaultVariants: {
    size: '13',
    weight: '400',
    tone: 'text',
    family: 'sans',
  },
});
