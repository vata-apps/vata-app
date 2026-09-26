import { borderPrimitives } from '$/styles/tokens/border.primitives.stylex';
import { colorPrimitives } from '$/styles/tokens/colorPrimitives.stylex';
import { colorTokens } from '$/styles/tokens/colorTokens.stylex';
import { create } from '@stylexjs/stylex';

export const styles = create({
  root: {
    width: '1.5rem',
    height: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderPrimitives.radiusFull,
    textDecoration: 'none',
    fontSize: '0.625rem',
    boxSizing: 'content-box',
  },

  active: {
    backgroundColor: {
      default: colorTokens.actionPrimary,
      ':hover': colorTokens.actionPrimaryHover,
      ':active': colorTokens.actionPrimaryActive,
    },
    color: { default: colorTokens.textOnPrimary },
    fontWeight: 'bold',

    borderColor: colorPrimitives.transparent,
    borderWidth: '1px',
    borderStyle: 'solid',
  },

  inactive: {
    backgroundColor: {
      default: colorTokens.actionSubtle,
      ':hover': colorTokens.actionSubtleHover,
      ':active': colorTokens.actionSubtleActive,
    },
    borderColor: colorPrimitives.olive100,
    borderWidth: '1px',
    borderStyle: 'solid',
    color: colorPrimitives.sand900,
  },
});
