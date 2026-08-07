import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

/**
 * Layout for the Overview tab body: a parents/names/media rail beside the
 * milestone events and places panels. The record rail is the narrower column —
 * its rows are short, while the events beside it carry dates, a spouse and a
 * place on one line.
 */

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: vars.space['6'],
  alignItems: 'start',
  '@media': {
    'screen and (min-width: 640px)': {
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.7fr)',
    },
  },
});

export const column = style({ display: 'flex', flexDirection: 'column', gap: vars.space['6'] });
