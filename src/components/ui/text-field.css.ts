/**
 * TextField styles — the warm-earth text input and textarea from the
 * Person editor, promoted to a shared primitive (ADR-0015).
 */
import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

const focusRing = {
  outline: `2px solid ${vars.color.accent}`,
  outlineOffset: 1,
  borderColor: vars.color.accent,
} as const;

export const input = style({
  height: 34,
  border: `1px solid ${vars.color.borderStrong}`,
  background: vars.color.panel,
  color: vars.color.text,
  borderRadius: vars.radius.sm,
  padding: '0 10px',
  fontSize: 13.5,
  width: '100%',
  boxShadow: 'inset 0 1px 1px rgba(0,0,0,.03)',
  fontFamily: 'inherit',
  selectors: {
    '&:hover': { borderColor: vars.color.faint },
    '&::placeholder': { color: vars.color.faint },
    '&:focus-visible': focusRing,
    '&:disabled': { opacity: 0.55, cursor: 'not-allowed' },
    '&:disabled:hover': { borderColor: vars.color.borderStrong },
  },
});

export const textarea = style([
  input,
  { height: 'auto', minHeight: 62, padding: '8px 10px', lineHeight: 1.45, resize: 'vertical' },
]);
