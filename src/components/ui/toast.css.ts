/**
 * Toast primitive styles — a Base UI `Toast` assembly styled from the
 * grayscale design tokens, plus the `err` status tint for a failed write.
 */
import { recipe } from '@vanilla-extract/recipes';

import { primitive, primitiveStyle, transitionFast } from '$/design/primitive-layer';
import { vars } from '$/design/theme.css';

export const viewport = primitiveStyle({
  position: 'fixed',
  bottom: vars.space['6'],
  right: vars.space['6'],
  zIndex: vars.zIndex.toast,
  display: 'flex',
  flexDirection: 'column-reverse',
  gap: vars.space['4'],
  width: 340,
  maxWidth: 'calc(100vw - 32px)',
});

export const root = recipe({
  base: primitive({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['1'],
    padding: vars.space['5'],
    // Clears the absolutely-positioned close IconButton (32px, offset space['3']).
    paddingRight: 44,
    background: vars.color.surface.card,
    border: `1px solid ${vars.color.border.default}`,
    borderRadius: vars.radius.md,
    boxShadow: vars.shadow.lg,
    fontFamily: vars.font.sans,
    transition: transitionFast('opacity', 'transform'),
    selectors: {
      '&[data-starting-style], &[data-ending-style]': { opacity: 0, transform: 'translateY(8px)' },
    },
  }),
  variants: {
    type: {
      error: primitive({
        color: vars.color.status.err.text,
        background: `color-mix(in srgb, ${vars.color.status.err.text} 12%, ${vars.color.surface.card})`,
        border: `1px solid color-mix(in srgb, ${vars.color.status.err.text} 30%, transparent)`,
      }),
    },
  },
});

export const title = primitiveStyle({
  fontSize: vars.text.sm,
  fontWeight: vars.weight.strong,
  color: 'inherit',
  margin: 0,
});

export const description = primitiveStyle({
  fontSize: vars.text.xs,
  color: 'inherit',
  opacity: 0.85,
  margin: 0,
  whiteSpace: 'pre-line',
});

/** Positions the shared `IconButton` primitive in the toast's corner — sizing/hover/focus all come from that primitive. */
export const close = primitiveStyle({
  position: 'absolute',
  top: vars.space['3'],
  right: vars.space['3'],
  color: 'inherit',
});
