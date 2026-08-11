import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';
import { body, section } from '../record-panel/record-detail-shell.css';

/** Styles for {@link ./event-detail}: the fields of one event record. */

export { body, section };

export const typeAndDate = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: vars.space['5'],
});

export const roleStatic = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['1'],
});

export const participantsList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['3'],
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const participantRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['3'],
});

export const participantName = style({
  flex: 1,
  minWidth: 0,
});

/**
 * Wraps the role `Select` in a participant row. The shared trigger sets
 * `width: 100%` to fill a `Field`; as a bare flex item that substitutes for
 * `flex-basis` and makes it claim the whole row, starving the name next to
 * it. This wrapper gives the trigger its own shrink-to-fit box to fill
 * instead.
 */
export const participantRole = style({
  flexShrink: 0,
});
