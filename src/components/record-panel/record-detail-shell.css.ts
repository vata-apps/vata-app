import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

/**
 * Shared shell for a record detail body — the outer flex column and the
 * divider between sections. Every `person-*` tab's `*-detail.css.ts` (Names,
 * Events, Relations, Notes) re-exports these two rather than redeclaring
 * them, since they were byte-for-byte identical across all four.
 */

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['5'],
});

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['3'],
  borderTop: `1px solid ${vars.color.border.subtle}`,
  paddingTop: vars.space['5'],
});
