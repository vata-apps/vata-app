import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';
import { body, section } from '../record-panel/record-detail-shell.css';

/** Styles for {@link ./note-detail}: the fields of one note record. */

export { body, section };

export const target = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['3'],
  padding: `${vars.space['1']} ${vars.space['3']}`,
  border: `1px solid ${vars.color.border.default}`,
  borderRadius: vars.radius.sm,
  background: vars.color.surface.card,
});

export const targetIcon = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: 26,
  height: 26,
  borderRadius: vars.radius.sm,
  background: vars.color.surface.hover,
  color: vars.color.text.muted,
});

export const targetBody = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  flex: 1,
});

export const targetLabel = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const charCount = style({
  fontFamily: vars.font.mono,
  fontSize: '10.5px',
  color: vars.color.text.subtle,
});

export const privacyRow = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.space['3'],
});

export const privacyText = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['1'],
  minWidth: 0,
  flex: 1,
});
