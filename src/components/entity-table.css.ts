/**
 * Application styles for {@link EntityTable}. Feature-level, unlayered so
 * they override the underlying `ui/Table` primitive where necessary.
 */
import { style } from '@vanilla-extract/css';

import { focusRing, vars } from '$/design/theme.css';

/** The primary cell link: plain text at body font, focusable, no underline until hover. */
export const rowLink = style({
  color: 'inherit',
  textDecoration: 'none',
  outline: 'none',
  selectors: {
    '&:hover': { textDecoration: 'underline' },
    '&:focus-visible': focusRing,
  },
});

export const stateCell = style({
  padding: `${vars.space['5']} ${vars.space['4']}`,
  textAlign: 'center',
});

export const stateTitle = style({
  margin: 0,
  fontFamily: vars.font.serif,
  fontSize: vars.text['16'].fontSize,
  lineHeight: vars.text['16'].lineHeight,
  fontStyle: 'italic',
  color: vars.color.text,
});

export const stateBody = style({
  margin: 0,
  marginTop: vars.space['2'],
  fontSize: vars.text['13'].fontSize,
  lineHeight: vars.text['13'].lineHeight,
  color: vars.color.muted,
});

export const stateActions = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space['3'],
  marginTop: vars.space['4'],
});
