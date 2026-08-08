import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

/** Styles for {@link ./record-sources}: the read-only Sources section shared by the Names and Events tabs. */

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['3'],
  borderTop: `1px solid ${vars.color.border.subtle}`,
  paddingTop: vars.space['5'],
});

export const sourcesList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['3'],
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const sourceItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['3'],
  color: vars.color.text.muted,
});
