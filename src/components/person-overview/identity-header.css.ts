import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

/** Layout for the identity band and the section tab bar. */

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space['5'],
});

export const identity = style({ display: 'flex', alignItems: 'center', gap: 18 });

export const meta = style({ display: 'flex', flexDirection: 'column', gap: vars.space['3'] });

/** The lineage signature: serif italic, the one place a person's name is set in Spectral. */
export const name = style({ fontStyle: 'italic', lineHeight: vars.leading.tight });

export const nameRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['5'],
  flexWrap: 'wrap',
});

export const metaRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['4'],
  flexWrap: 'wrap',
});

export const metaSegment = style({ display: 'flex', alignItems: 'center', gap: vars.space['4'] });

/* ---- section tab bar ------------------------------------------------- */

export const tabs = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['6'],
  borderBottom: `1px solid ${vars.color.border.subtle}`,
});

export const tab = style({
  display: 'inline-flex',
  alignItems: 'center',
  height: 38,
  fontSize: vars.text.sm,
  lineHeight: vars.leading.normal,
  fontWeight: vars.weight.semibold,
  color: vars.color.text.muted,
  textDecoration: 'none',
  borderBottom: '2px solid transparent',
  selectors: {
    '&:hover': { color: vars.color.text.body },
  },
});

export const tabActive = style({
  color: vars.color.brand.base,
  fontWeight: vars.weight.strong,
  borderBottomColor: vars.color.brand.base,
  selectors: {
    '&:hover': { color: vars.color.brand.base },
  },
});
