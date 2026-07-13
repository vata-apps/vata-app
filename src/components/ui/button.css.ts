/**
 * Button variant styles using `@vanilla-extract/recipes`.
 * Variants: solid (primary CTA), ghost (secondary), danger (destructive),
 * icon (icon-only square), add (dashed "+ Add …" trigger).
 */
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '$/design/theme.css';

const focusRing = {
  outline: `2px solid ${vars.color.accent}`,
  outlineOffset: 2,
} as const;

export const button = recipe({
  base: {
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'inherit',
    border: '1px solid transparent',
    selectors: {
      '&:focus-visible': focusRing,
      '&:disabled': { cursor: 'default', opacity: 0.6 },
    },
  },
  variants: {
    variant: {
      solid: {
        height: 34,
        borderRadius: vars.radius.sm,
        padding: '0 16px',
        fontSize: 13,
        fontWeight: 600,
        gap: 8,
        background: vars.color.accent,
        color: vars.color.accentText,
        selectors: { '&:hover:not(:disabled)': { background: vars.color.accentHover } },
      },
      ghost: {
        height: 34,
        borderRadius: vars.radius.sm,
        padding: '0 16px',
        fontSize: 13,
        fontWeight: 600,
        gap: 8,
        background: 'transparent',
        color: vars.color.muted,
        selectors: { '&:hover:not(:disabled)': { color: vars.color.text } },
      },
      danger: {
        height: 34,
        borderRadius: vars.radius.sm,
        padding: '0 16px',
        fontSize: 13,
        fontWeight: 600,
        gap: 8,
        background: vars.color.danger,
        color: vars.color.accentText,
        selectors: { '&:hover:not(:disabled)': { filter: 'brightness(0.94)' } },
      },
      icon: {
        width: 30,
        height: 30,
        borderRadius: 6,
        background: 'transparent',
        color: vars.color.faint,
        justifyContent: 'center',
        flex: '0 0 auto',
        selectors: {
          '&:hover': { background: vars.color.subtle, color: vars.color.danger },
          '&:disabled': { opacity: 0.5 },
        },
      },
      add: {
        alignSelf: 'flex-start',
        background: 'transparent',
        border: `1px dashed ${vars.color.borderStrong}`,
        color: vars.color.muted,
        borderRadius: vars.radius.sm,
        height: 32,
        padding: '0 12px',
        fontSize: 12.5,
        fontWeight: 600,
        gap: 7,
        selectors: {
          '&:hover:not(:disabled)': { borderColor: vars.color.accent, color: vars.color.accent },
        },
      },
    },
  },
  defaultVariants: { variant: 'solid' },
});
