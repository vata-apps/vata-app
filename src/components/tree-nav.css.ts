import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

export const nav = style({
  width: 64,
  flexShrink: 0,
  height: '100%',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.space['3'],
  padding: `${vars.space['5']} ${vars.space['4']}`,
  borderRight: `1px solid ${vars.color.border.subtle}`,
});

export const settingsTrigger = style({ marginTop: 'auto' });
