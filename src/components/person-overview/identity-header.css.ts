import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

/** Layout for the identity band and the section tab bar. */

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space['3'],
});

export const identity = style({ display: 'flex', alignItems: 'center', gap: vars.space['3'] });

export const meta = style({ display: 'flex', flexDirection: 'column', gap: vars.space['1.5'] });

export const nameRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['3'],
  flexWrap: 'wrap',
});

export const metaRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['2'],
  flexWrap: 'wrap',
});

export const metaSegment = style({ display: 'flex', alignItems: 'center', gap: vars.space['2'] });

/* ---- section tab bar ------------------------------------------------- */

export const tabs = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['4'],
  borderBottom: `1px solid ${vars.color.border}`,
});

export const tab = style({
  display: 'inline-flex',
  alignItems: 'center',
  height: 38,
  fontSize: vars.text['13'].fontSize,
  lineHeight: vars.text['13'].lineHeight,
  fontWeight: 550,
  color: vars.color.muted,
  textDecoration: 'none',
  borderBottom: '2px solid transparent',
  selectors: {
    '&:hover': { color: vars.color.text },
  },
});

export const tabActive = style({
  color: vars.color.accent,
  fontWeight: 650,
  borderBottomColor: vars.color.accent,
  selectors: {
    '&:hover': { color: vars.color.accent },
  },
});
