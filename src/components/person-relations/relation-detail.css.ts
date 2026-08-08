import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

/** Styles for {@link ./relation-detail}: the fields of one relation record. */

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['5'],
});

export const typeAndNature = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: vars.space['5'],
});

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['3'],
  borderTop: `1px solid ${vars.color.border.subtle}`,
  paddingTop: vars.space['5'],
});

export const typeStatic = style({
  display: 'flex',
  alignItems: 'center',
  minHeight: 34,
});
