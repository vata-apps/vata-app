import { style } from '@vanilla-extract/css';

export const root = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
});

export const body = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  overflow: 'hidden',
});

export const rows = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
});

export const footer = style({
  position: 'sticky',
  bottom: 0,
  backgroundColor: 'rgb(250, 250, 250)',
  borderTop: '1px solid rgb(226, 226, 226)',
  padding: '0.75rem',
});
