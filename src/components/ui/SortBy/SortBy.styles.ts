import { colorPrimitives } from '$/styles/tokens/colorPrimitives.stylex';
import { colorTokens } from '$/styles/tokens/colorTokens.stylex';
import { create } from '@stylexjs/stylex';

export const styles = create({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  trigger: {
    borderStyle: 'solid',
    borderWidth: '1px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderRadius: '0.5rem',
    width: 'fit-content',

    // --- Variants ---
    backgroundColor: colorPrimitives.white,
    borderColor: colorPrimitives.gray300,

    // --- Sizes ---
    height: '28px',
    fontSize: '12px',
    gap: '8px',
    paddingInlineStart: '12px',
    paddingInlineEnd: '8px',
  },

  label: {
    fontSize: '12px',
    color: colorPrimitives.gray500,
  },

  value: {
    flexShrink: 0,
  },

  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'translateY(1px)',
    color: colorPrimitives.gray300,
  },

  popup: {
    backgroundColor: colorPrimitives.white,
    borderColor: colorPrimitives.gray300,
    borderStyle: 'solid',
    borderWidth: '1px',
    borderRadius: '0.5rem',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)',
    padding: '0.5rem',
    // minWidth: 160,
    maxHeight: 260,
    overflow: 'auto',
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },

  item: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '0.5rem',
    fontSize: '12px',
    gap: '6px',

    paddingInlineStart: {
      default: '8px',
      ':not([data-selected])': '30px',
    },
    paddingInlineEnd: '8px',
    paddingBlock: '4px',

    color: {
      default: colorTokens.textPrimary,
      '[data-selected]': colorTokens.textOnPrimary,
    },

    cursor: 'pointer',
    userSelect: 'none',
    outline: 'none',

    backgroundColor: {
      default: 'none',
      '[data-highlighted]': colorPrimitives.olive50,
      '[data-selected]:has(:not([data-highlighted]))': colorTokens.actionPrimary,
    },
  },

  itemIndicator: {
    display: 'flex',
  },
});
