/**
 * EntityPicker primitive styles — the search-and-attach popover content.
 * Built on the `ui/popover` and `ui/search-input` primitives; this file only
 * styles the picker's own search wrap, result rows and create footer.
 */
import { primitiveStyle, transitionFast } from '$/design/primitive-layer';
import { vars } from '$/design/theme.css';

export const search = primitiveStyle({
  padding: vars.space['5'],
  borderBottom: `1px solid ${vars.color.border.subtle}`,
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
  },
});

export const rowBody = primitiveStyle({ minWidth: 0, flex: 1 });

export const rowTitle = primitiveStyle({
  display: 'block',
  fontSize: vars.text.md,
  fontWeight: vars.weight.semibold,
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
  borderTop: `1px solid ${vars.color.border.subtle}`,
  padding: vars.space['3'],
  background: vars.color.surface.app,
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
  },
});

export const createLabel = primitiveStyle({
  fontSize: vars.text.sm,
  fontWeight: vars.weight.semibold,
});
