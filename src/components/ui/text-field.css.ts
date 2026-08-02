/**
 * TextField primitive styles — single-line input and multiline textarea.
 *
 * Both variants share the same field chrome (border, background, focus ring,
 * disabled state); only the box model and vertical padding differ.
 */
import { recipe } from '@vanilla-extract/recipes';

import { primitive, transitionFast } from '$/design/primitive-layer';
import { focusRing, vars } from '$/design/theme.css';

export const textField = recipe({
  base: primitive({
    border: `1px solid ${vars.color.border.default}`,
    background: vars.color.surface.card,
    color: vars.color.text.strong,
    borderRadius: vars.radius.sm,
    fontSize: vars.text.sm,
    width: '100%',
    fontFamily: 'inherit',
    transition: transitionFast('border-color', 'box-shadow'),
    selectors: {
      '&:hover:not(:disabled)': { borderColor: vars.color.border.strong },
      '&::placeholder': { color: vars.color.text.subtle },
      '&:focus-visible': {
        ...focusRing,
        borderColor: vars.color.border.focus,
      },
      '&:disabled': {
        background: vars.color.surface.sunken,
        color: vars.color.text.muted,
        cursor: 'not-allowed',
      },
    },
  }),
  variants: {
    multiline: {
      false: primitive({
        height: 34,
        padding: `0 ${vars.space['5']}`,
      }),
      true: primitive({
        height: 'auto',
        minHeight: 62,
        padding: `${vars.space['4']} ${vars.space['5']}`,
        lineHeight: vars.leading.normal,
        resize: 'vertical',
      }),
    },
  },
  defaultVariants: {
    multiline: false,
  },
});
