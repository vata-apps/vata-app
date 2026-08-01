/**
 * Application styles for {@link EntityTable}. Feature-level, unlayered so
 * they override the underlying `ui/Table` primitive where necessary.
 */
import { style } from '@vanilla-extract/css';

import { focusRing, vars } from '$/design/theme.css';

/** The primary cell link: plain text at body font, focusable, never underlined. */
export const rowLink = style({
  color: 'inherit',
  textDecoration: 'none',
  outline: 'none',
  selectors: {
    '&:focus-visible': focusRing,
  },
});

export const stateCell = style({
  padding: `${vars.space['7']} ${vars.space['6']}`,
  textAlign: 'center',
});

export const stateTitle = style({
  margin: 0,
  fontFamily: vars.font.serif,
  fontSize: vars.text.lg,
  lineHeight: vars.leading.normal,
  fontStyle: 'italic',
  color: vars.color.text.strong,
});

export const stateBody = style({
  margin: 0,
  marginTop: vars.space['4'],
  fontSize: vars.text.sm,
  lineHeight: vars.leading.normal,
  color: vars.color.text.muted,
});

export const stateActions = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space['5'],
  marginTop: vars.space['6'],
});
