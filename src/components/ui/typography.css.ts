/**
 * Typography primitive styles — a single polymorphic text component.
 *
 * Variants are declared with `recipe()` beside the styles they select
 * (ADR-0015). The semantic boundary between a "text" and a "heading" is
 * handled by the `as` prop, not by separate components.
 */
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '$/design/theme.css';

export const typography = recipe({
  base: {
    margin: 0,
  },
  variants: {
    size: {
      '12.5': {
        fontSize: vars.text['12.5'].fontSize,
        lineHeight: vars.text['12.5'].lineHeight,
      },
      '13': {
        fontSize: vars.text['13'].fontSize,
        lineHeight: vars.text['13'].lineHeight,
      },
      '13.5': {
        fontSize: vars.text['13.5'].fontSize,
        lineHeight: vars.text['13.5'].lineHeight,
      },
      '15': {
        fontSize: vars.text['15'].fontSize,
        lineHeight: vars.text['15'].lineHeight,
      },
      '16': {
        fontSize: vars.text['16'].fontSize,
        lineHeight: vars.text['16'].lineHeight,
      },
    },
    weight: {
      '400': { fontWeight: 400 },
      '500': { fontWeight: 500 },
      '550': { fontWeight: 550 },
      '600': { fontWeight: 600 },
      '650': { fontWeight: 650 },
      '700': { fontWeight: 700 },
    },
    tone: {
      text: { color: vars.color.text },
      muted: { color: vars.color.muted },
      faint: { color: vars.color.faint },
      accent: { color: vars.color.accent },
      danger: { color: vars.color.danger },
      warn: { color: vars.color.warn },
    },
    family: {
      sans: { fontFamily: vars.font.sans },
      serif: { fontFamily: vars.font.serif },
      mono: { fontFamily: vars.font.mono },
    },
  },
  defaultVariants: {
    size: '13',
    weight: '400',
    tone: 'text',
    family: 'sans',
  },
});
