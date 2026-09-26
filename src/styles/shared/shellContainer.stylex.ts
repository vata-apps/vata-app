// src/styles/shared/shellContainer.stylex.ts
import { colorTokens } from '$/styles/tokens/colorTokens.stylex';
import * as stylex from '@stylexjs/stylex';

export const shellContainer = stylex.create({
  base: {
    backgroundColor: colorTokens.surfaceShell,
    borderColor: colorTokens.borderDefault,
  },

  borderBlockEnd: {
    borderBlockEndWidth: '1px',
    borderBlockEndStyle: 'solid',
  },

  borderInlineEnd: {
    borderInlineEndWidth: '1px',
    borderInlineEndStyle: 'solid',
  },
});
