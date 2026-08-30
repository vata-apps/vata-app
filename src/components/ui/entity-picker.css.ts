/**
 * EntityPicker primitive styles — the search-and-attach popover content.
 * Built on the `ui/popover` and `ui/search-input` primitives; this file only
 * styles the picker's own search wrap, result rows and create footer.
 */
import { style } from '@vanilla-extract/css';

import { primitiveStyle, transitionFast } from '$/design/primitive-layer';
import { focusRing, vars } from '$/design/theme.css';

export const popup = primitiveStyle({ width: 300 });

/** Cancels `Popover.Popup`'s own padding so the search/footer bands can bleed to its edges. */
const bleed = `calc(${vars.space['4']} * -1)`;

export const search = primitiveStyle({
  margin: `${bleed} ${bleed} 0`,
  padding: vars.space['5'],
  borderBottom: `1px solid ${vars.color.border.subtle}`,
  borderTopLeftRadius: vars.radius.md,
  borderTopRightRadius: vars.radius.md,
});

/**
 * Passed to the popover's {@link SearchInput}: the field autofocuses on open,
 * so the app-wide focus halo lands the instant the popover appears and reads
 * as a heavy slab against the popup edge. This drops the halo — the border
 * darkening alone marks focus on a surface this small. Unlayered on purpose,
 * so it overrides the primitive's own `:focus-within` without a specificity
 * fight (see `src/design/primitive-layer.ts`).
 */
export const searchFlatFocus = style({
  selectors: {
    '&:focus-within': { boxShadow: 'none' },
  },
});

export const list = primitiveStyle({
  maxHeight: 250,
  overflow: 'auto',
  padding: vars.space['3'],
});

export const row = primitiveStyle({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['5'],
  width: '100%',
  boxSizing: 'border-box',
  padding: vars.space['4'],
  border: 'none',
  background: 'none',
  borderRadius: vars.radius.sm,
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'inherit',
  transition: transitionFast('background'),
  selectors: {
    '&:hover': { background: vars.color.surface.hover },
    '&:focus-visible': focusRing,
  },
});

export const rowBody = primitiveStyle({ minWidth: 0, flex: 1 });

export const rowTitle = primitiveStyle({
  display: 'block',
  fontSize: vars.text.md,
  fontWeight: vars.weight.medium,
  lineHeight: '1.25',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  color: vars.color.text.body,
});

export const rowMeta = primitiveStyle({
  display: 'block',
  fontSize: vars.text['2xs'],
  color: vars.color.text.muted,
  marginTop: 2,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const hint = primitiveStyle({
  padding: `${vars.space['4']} ${vars.space['3']}`,
  fontSize: vars.text.xs,
  color: vars.color.text.muted,
});

export const foot = primitiveStyle({
  margin: `0 ${bleed} ${bleed}`,
  borderTop: `1px solid ${vars.color.border.subtle}`,
  padding: vars.space['3'],
  background: vars.color.surface.app,
  borderBottomLeftRadius: vars.radius.md,
  borderBottomRightRadius: vars.radius.md,
});

export const create = primitiveStyle({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['5'],
  width: '100%',
  boxSizing: 'border-box',
  padding: vars.space['4'],
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  color: vars.color.brand.base,
  fontFamily: 'inherit',
  textAlign: 'left',
  borderRadius: vars.radius.sm,
  transition: transitionFast('background'),
  selectors: {
    '&:hover': { background: vars.color.brand.subtleBg },
    '&:focus-visible': focusRing,
  },
});

export const createLabel = primitiveStyle({
  fontSize: vars.text.sm,
  fontWeight: vars.weight.semibold,
});
