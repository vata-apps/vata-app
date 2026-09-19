import { recipe } from '@vanilla-extract/recipes';

import { primitive, transitionFast } from '$/design/primitive-layer';
import { focusRing, vars } from '$/design/theme.css';

export const button = recipe({
  base: primitive({
    lineHeight: vars.leading.none,
    fontWeight: vars.weight.medium,
    cursor: 'pointer',
    border: '1px solid transparent',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
    transition: transitionFast('background', 'border-color', 'scale'),
    selectors: {
      '&:focus-visible': focusRing,
      '&:disabled': { cursor: 'not-allowed', opacity: 0.6 },
      '&:active': { scale: 0.98 },
    },
  }),
  variants: {
    size: {
      sm: {
        borderRadius: '4px',
        fontSize: '11px',
        gap: '6px',
        padding: '6px 12px',
      },
      md: {
        borderRadius: '6px',
        fontSize: '13px',
        gap: '8px',
        padding: '8px 16px',
      },
    },

    variant: {
      primary: primitive({
        background: 'rgb(31, 31, 31)',
        color: vars.color.text.onBrand,
        selectors: {
          '&:hover:not(:disabled)': { background: 'rgb(0,0,0)' },
          '&:active:not(:disabled)': { background: vars.color.brand.active },
        },
      }),
      secondary: primitive({
        background: '#fff',
        border: `1px solid ${vars.color.border.default}`,
        color: vars.color.text.body,
        selectors: {
          '&:hover:not(:disabled)': { borderColor: '#000' },
        },
      }),
      danger: primitive({
        background: vars.color.status.err.bg,
        color: vars.color.status.err.fg,
        selectors: {
          '&:hover:not(:disabled)': {
            background: `color-mix(in srgb, ${vars.color.status.err.bg} 85%, black)`,
          },
        },
      }),
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'primary',
  },
});
