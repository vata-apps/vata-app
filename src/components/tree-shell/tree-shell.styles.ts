import { create } from '@stylexjs/stylex';

export const styles = create({
  root: {
    display: 'flex',
    flexDirection: 'row',
    height: '100vh',
    overflow: 'hidden',
  },

  body: {
    flex: '1 1 auto',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  main: {
    flex: '1 1 auto',
    minHeight: 0,
    overflow: 'auto',
  },
});
