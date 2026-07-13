/**
 * Typography variant styles — a polymorphic text component covering the size,
 * weight, tone, and family axes used in the warm-earth design system (ADR-0015).
 * Consumed by the Typography component and any future component that needs
 * variant-keyed text styles.
 */
import { recipe } from '@vanilla-extract/recipes';

import { vars, text } from '$/design/theme.css';

export const typography = recipe({
  base: { margin: 0 },
  variants: {
    size: {
      xs: { fontSize: text.xs.size, lineHeight: text.xs.lineHeight },
      sm: { fontSize: text.sm.size, lineHeight: text.sm.lineHeight },
      base: { fontSize: text.base.size, lineHeight: text.base.lineHeight },
      md: { fontSize: text.md.size, lineHeight: text.md.lineHeight },
      lg: { fontSize: text.lg.size, lineHeight: text.lg.lineHeight },
    },
    weight: {
      normal: { fontWeight: 400 },
      medium: { fontWeight: 550 },
      semibold: { fontWeight: 600 },
      bold: { fontWeight: 650 },
    },
    tone: {
      default: { color: vars.color.text },
      muted: { color: vars.color.muted },
      faint: { color: vars.color.faint },
      accent: { color: vars.color.accent },
      danger: { color: vars.color.danger },
    },
    family: {
      sans: { fontFamily: vars.font.sans },
      serif: { fontFamily: vars.font.serif },
      mono: { fontFamily: vars.font.mono },
    },
  },
  defaultVariants: {
    size: 'base',
    weight: 'normal',
    tone: 'default',
    family: 'sans',
  },
});
