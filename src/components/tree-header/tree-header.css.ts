import { style } from '@vanilla-extract/css';

export const root = style({
  height: '4rem',
  flexShrink: 0,
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  padding: `0 1.5rem`,
  borderBottom: `1px solid rgb(226, 226, 226)`,
  backgroundColor: 'rgb(247, 247, 247)',
});

export const actions = style({
  marginLeft: 'auto',
  display: 'flex',
  gap: '0.5rem',
});
