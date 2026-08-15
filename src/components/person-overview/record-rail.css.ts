import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

export const rail = style({ display: 'flex', flexDirection: 'column', gap: vars.space['6'] });

export const parentRow = style({ display: 'flex', alignItems: 'center', gap: vars.space['5'] });

export const missingSlot = style({ display: 'flex', alignItems: 'center', gap: vars.space['4'] });

/** Father / Mother, pinned to the trailing edge of its parent row. */
export const roleLabel = style({ marginLeft: 'auto', flexShrink: 0 });

export const nameRow = style({ display: 'flex', alignItems: 'center', gap: vars.space['4'] });

export const nameRowText = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['3'],
});

/** Primary badge, pinned to the trailing edge and centered on the full row height. */
export const namePrimaryBadge = style({ marginLeft: 'auto', flexShrink: 0 });
