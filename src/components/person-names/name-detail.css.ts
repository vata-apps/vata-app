import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';
import { body } from '../record-panel/record-detail-shell.css';

/** Styles for {@link ./name-detail}: the fields of one name record. */

export { body };

/** Given names and surname share a row once there is room for two columns. */
export const nameParts = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: vars.space['5'],
});

/** Prefix, suffix and nickname are the rarer parts — narrower and grouped. */
export const affixes = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
  gap: vars.space['5'],
});

export const primaryRow = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: vars.space['5'],
  borderTop: `1px solid ${vars.color.border.subtle}`,
  paddingTop: vars.space['5'],
});

export const primaryText = style({
  minWidth: 0,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['1'],
});
