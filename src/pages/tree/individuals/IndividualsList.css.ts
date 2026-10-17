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

export const row = style({
  position: 'relative',
  cursor: 'pointer',
  display: 'flex',
  backgroundColor: '#fff',
  border: '1px solid rgb(228, 228, 228)',
  borderRadius: '10px',
  width: '100%',
  padding: '12px 40px 12px 12px',
  gap: '12px',
});

export const rowName = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',

  fontSize: '1rem',
  color: 'rgb(26, 26, 26)',

  width: '50%',
});

export const rowChevron = style({
  position: 'absolute',
  right: '0.75rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'rgb(180,180,180)',
  height: '1rem',
  width: '1rem',
});

export const footer = style({
  position: 'sticky',
  bottom: 0,
  backgroundColor: 'rgb(250, 250, 250)',
  borderTop: '1px solid rgb(226, 226, 226)',
  padding: '0.75rem',
});
