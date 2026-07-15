import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

/**
 * Shared layout styles for the full-width entity-list section pages.
 * These are the page chrome primitives (header, title, toolbar, table wrapper)
 * that every migrated list screen — People, Families, Places, Events — composes
 * above its {@link EntityTable}.
 */

export const page = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['4'],
  padding: vars.space['4'],
  height: '100%',
  minHeight: 0,
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: vars.space['2'],
  paddingBottom: vars.space['3'],
  flexShrink: 0,
});

export const title = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['3'],
});

export const toolbar = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: vars.space['3'],
  flexShrink: 0,
});

export const tableWrapper = style({
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: vars.radius.sm,
  background: vars.color.panel,
});
