/**
 * Avatar primitive styles — a circular monogram/photo assembly.
 *
 * Variants are declared with `recipe()` beside the styles they select
 * (ADR-0005). `Fallback` inherits its color from the `Root` tone rather than
 * declaring its own, so the two never drift apart.
 */
import { recipe } from '@vanilla-extract/recipes';

import { primitive, primitiveStyle } from '$/design/primitive-layer';
import { vars } from '$/design/theme.css';

export const root = recipe({
  base: primitive({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    fontFamily: vars.font.sans,
    fontWeight: 700,
  }),
  variants: {
    size: {
      sm: primitive({ width: 24, height: 24, fontSize: 10 }),
      md: primitive({ width: 32, height: 32, fontSize: 13 }),
      lg: primitive({ width: 48, height: 48, fontSize: 18 }),
    },
    tone: {
      accent: primitive({ background: vars.color.accent, color: vars.color.accentText }),
      accentSoft: primitive({ background: vars.color.accentSoft, color: vars.color.accent }),
      neutral: primitive({ background: vars.color.subtle, color: vars.color.muted }),
    },
  },
  defaultVariants: {
    size: 'md',
    tone: 'accentSoft',
  },
});

export const image = primitiveStyle({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export const fallback = primitiveStyle({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  color: 'inherit',
});
