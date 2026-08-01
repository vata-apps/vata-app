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
    fontWeight: vars.weight.semibold,
  }),
  variants: {
    size: {
      sm: primitive({ width: 24, height: 24, fontSize: 10 }),
      md: primitive({ width: 32, height: 32, fontSize: 13 }),
      lg: primitive({ width: 48, height: 48, fontSize: 18 }),
    },
    tone: {
      /** Tinted brand fill — the default reference to a person. */
      brand: primitive({ background: vars.color.brand.subtleBg, color: vars.color.brand.hover }),
      /** Muted gray — subordinate/secondary references. */
      neutral: primitive({ background: vars.color.surface.sunken, color: vars.color.text.muted }),
      /** Dashed outline — a draft or not-yet-linked person. */
      outline: primitive({
        background: 'transparent',
        border: `1px dashed ${vars.color.border.strong}`,
        color: vars.color.text.subtle,
      }),
    },
  },
  defaultVariants: {
    size: 'md',
    tone: 'brand',
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
