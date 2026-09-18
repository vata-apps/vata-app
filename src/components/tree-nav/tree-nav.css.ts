import { style } from '@vanilla-extract/css';

export const nav = style({
  width: 50,
  flexShrink: 0,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.625rem',
  padding: `0.625rem 0`,
  borderRight: `1px solid rgb(226, 226, 226)`,
  backgroundColor: 'rgb(247, 247, 247)',
});
