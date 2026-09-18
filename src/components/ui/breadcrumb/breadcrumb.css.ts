import { vars } from '$/design/theme.css';
import { style } from '@vanilla-extract/css';

export const root = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: 'rgb(200, 200, 200)',
});

export const item = style({
  color: 'rgb(26, 26, 26)',
  fontWeight: vars.weight.bold,
  fontSize: '1.25rem',
});

export const link = style({
  color: 'rgb(26, 26, 26)',
  fontSize: '1rem',
  textDecoration: 'none',
  ':hover': {
    color: 'rgb(0, 0, 0)',
  },
});
