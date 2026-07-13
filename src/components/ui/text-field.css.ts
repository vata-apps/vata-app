/**
 * TextField primitive styles — single-line input and multiline textarea.
 *
 * Both variants share the same field chrome (border, background, focus ring,
 * disabled state); only the box model and vertical padding differ.
 */
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '$/design/theme.css';

const focusRing = {
  outline: `2px solid ${vars.color.accent}`,
  outlineOffset: 2,
};

const fieldBase = {
  border: `1px solid ${vars.color.borderStrong}`,
  background: vars.color.panel,
  color: vars.color.text,
  borderRadius: vars.radius.sm,
  fontSize: vars.text['13.5'].fontSize,
  lineHeight: vars.text['13.5'].lineHeight,
  width: '100%',
  boxShadow: 'inset 0 1px 1px rgba(0,0,0,.03)',
  fontFamily: 'inherit',
  selectors: {
    '&:hover': { borderColor: vars.color.faint },
    '&::placeholder': { color: vars.color.faint },
    '&:focus-visible': {
      ...focusRing,
      outlineOffset: 1,
      borderColor: vars.color.accent,
    },
    '&:disabled': { opacity: 0.55, cursor: 'not-allowed' },
    '&:disabled:hover': { borderColor: vars.color.borderStrong },
  },
} as const;

export const textField = recipe({
  base: fieldBase,
  variants: {
    multiline: {
      false: {
        height: 34,
        padding: `0 ${vars.space['2.5']}`,
      },
      true: {
        height: 'auto',
        minHeight: 62,
        padding: `${vars.space['2']} ${vars.space['2.5']}`,
        lineHeight: 1.45,
        resize: 'vertical',
      },
    },
  },
  defaultVariants: {
    multiline: false,
  },
});
