import { style } from '@vanilla-extract/css';

import { inlinePadding } from '$components/ui/card.css';
import { vars } from '$/design/theme.css';

/**
 * The map is inset from the card edges rather than run full-bleed: it is a
 * figure inside the panel, not another row, so it keeps its own rounded frame.
 * The inset is the card's own row padding, so the map stays flush with the
 * rows above and below it however that padding is retuned.
 */
export const map = style({
  margin: `${vars.space['1']} ${inlinePadding} 0`,
  borderRadius: vars.radius.sm,
  overflow: 'hidden',
});

export const placeRow = style({ display: 'flex', flexDirection: 'column', gap: vars.space['3'] });

export const tags = style({ display: 'flex', gap: vars.space['4'], flexWrap: 'wrap' });
