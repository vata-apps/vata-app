import { colorTokens } from '$/styles/tokens/colorTokens.stylex';
import { borders } from '$/styles/tokens/semantics.stylex';
import { create } from '@stylexjs/stylex';

export const styles = create({
  base: {
    border: borders.transparent,

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
    fontWeight: '600',
    gap: '6px',
    padding: '0.5rem 1rem',
  },
});
