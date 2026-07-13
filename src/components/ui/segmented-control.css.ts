/**
 * SegmentedControl styles — the radiogroup button cluster from the Person editor,
 * promoted to a shared primitive (ADR-0015).
 */
import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

const focusRing = {
  outline: `2px solid ${vars.color.accent}`,
  outlineOffset: 2,
} as const;

export const root = style({
  display: 'inline-flex',
  background: vars.color.subtle,
  borderRadius: 8,
  padding: 3,
  gap: 2,
  width: 'max-content',
});

export const item = style({
  padding: '6px 13px',
  borderRadius: 6,
  fontSize: 12.5,
  fontWeight: 600,
  color: vars.color.muted,
  cursor: 'pointer',
  border: 'none',
  background: 'transparent',
  fontFamily: 'inherit',
  selectors: {
    '&:disabled': { cursor: 'default', opacity: 0.6 },
    '&:focus-visible': focusRing,
  },
});

export const itemActive = style({
  background: vars.color.panel,
  color: vars.color.text,
  boxShadow: vars.shadow.sm,
});
