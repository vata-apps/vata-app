import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';
import { root as searchFieldRoot } from './ui/search-input.css';

export const header = style({
  height: 56,
  flexShrink: 0,
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['6'],
  padding: `0 ${vars.space['8']}`,
  borderBottom: `1px solid ${vars.color.border.subtle}`,
  background: vars.color.surface.card,
});

// Same bordered-field chrome as `SearchInput`'s root, applied to a disabled
// trigger button instead of a live `<input>` — only the width and the
// disabled-state opacity reset differ.
export const search = `${searchFieldRoot} ${style({
  width: 260,
  cursor: 'default',
  selectors: {
    '&:disabled': { opacity: 1 },
  },
})}`;

export const searchLabel = style({
  flex: 1,
  minWidth: 0,
  textAlign: 'left',
  fontFamily: vars.font.sans,
  fontSize: vars.text.sm,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const spacer = style({ flex: 1 });
