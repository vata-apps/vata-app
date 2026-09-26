import { create } from '@stylexjs/stylex';

export const styles = create({
  root: {
    width: 50,
    flexShrink: 0,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.625rem',
    padding: `0.625rem 0`,
  },
});
