import { borderPrimitives } from '$/styles/tokens/border.primitives.stylex';
import { colorPrimitives } from '$/styles/tokens/colorPrimitives.stylex';
import { colorTokens } from '$/styles/tokens/colorTokens.stylex';

import { create } from '@stylexjs/stylex';

export const styles = create({
  base: {
    borderWidth: borderPrimitives.width1px,
    borderStyle: borderPrimitives.styleSolid,
    borderColor: colorPrimitives.transparent,

    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',

    scale: { ':active:not(:disabled)': '0.98' },

    opacity: { ':disabled': '0.6' },

    cursor: { ':disabled': 'not-allowed' },
  },

  // --- Variants ---
  primary: {
    backgroundColor: {
      default: colorTokens.actionPrimary,
      ':hover:not(:disabled)': colorTokens.actionPrimaryHover,
      ':active:not(:disabled)': colorTokens.actionPrimaryActive,
    },

    color: {
      default: colorTokens.textOnPrimary,
    },
  },

  // --- Sizes ---
  md: {
    borderRadius: '0.5rem',
    fontSize: '14px',
    gap: '6px',
    padding: '0.5rem 1rem',
  },
});
