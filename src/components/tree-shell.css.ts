import { style } from '@vanilla-extract/css';

export const shell = style({
  display: 'flex',
  flexDirection: 'row',
  height: '100vh',
  overflow: 'hidden',
});

export const body = style({
  flex: '1 1 auto',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

// minHeight: 0 lets <main> shrink below its content's min-content height on
// the column's main axis, so wide/tall content scrolls inside <main> instead
// of overflowing past the header.
export const main = style({
  flex: '1 1 auto',
  minHeight: 0,
  overflow: 'auto',
});
