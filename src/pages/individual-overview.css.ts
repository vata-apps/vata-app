import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

/**
 * Layout for the Overview tab body: a parents/names/media rail beside a
 * life-events spine and places panel.
 */

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: vars.space['4'],
  alignItems: 'start',
  '@media': {
    'screen and (min-width: 640px)': {
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
    },
  },
});

export const column = style({ display: 'flex', flexDirection: 'column', gap: vars.space['4'] });
