import { vars } from '$/design/theme.css';
import { recipe } from '@vanilla-extract/recipes';

export const item = recipe({
  base: {
    width: '1.5rem',
    height: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: vars.radius.full,
    textDecoration: 'none',
    fontSize: '0.625rem',
    fontFamily: vars.font.mono,
    boxSizing: 'content-box',
  },
  variants: {
    isActive: {
      true: {
        background: 'rgb(0, 0, 0)',
        color: 'rgb(255, 255, 255)',
        fontWeight: 'bold',
      },
      false: {
        backgroundColor: 'rgb(238, 238, 238)',
        border: `1px solid rgb(221, 221, 221)`,
        color: 'rgb(119, 119, 119)',
      },
    },
  },
});
