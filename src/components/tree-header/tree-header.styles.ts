import { create } from '@stylexjs/stylex';

export const styles = create({
  root: {
    height: '4rem',
    flexShrink: 0,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    padding: `0 1.5rem`,
  },

  actions: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
});
