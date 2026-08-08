import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';
import { body, section } from '../record-panel/record-detail-shell.css';

/** Styles for {@link ./relation-detail}: the fields of one relation record. */

export { body, section };

export const typeAndNature = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: vars.space['5'],
});

export const typeStatic = style({
  display: 'flex',
  alignItems: 'center',
  minHeight: 34,
});
