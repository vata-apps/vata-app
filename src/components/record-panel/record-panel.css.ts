import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

/**
 * Layout for {@link ./record-panel}: the list column beside its detail panel.
 *
 * The two breakpoints below are **container** queries, not media queries. The
 * person tabs sit inside a shell whose width depends on the people rail being
 * expanded or collapsed, so the same window can leave this area either wide or
 * narrow — only the container's own width may decide whether the detail is a
 * sticky side panel or an inline expansion.
 */

/** Query target for both breakpoints. Named so nested containers can't capture them. */
const CONTAINER = 'vata-record-panel';

/** Below this the detail expands inline under its row; at or above it becomes a sticky side panel. */
const PANEL_BREAKPOINT = '900px';

/** Above this there is room for a wider detail panel beside the list. */
const WIDE_BREAKPOINT = '1500px';

export const shell = style({
  containerType: 'inline-size',
  containerName: CONTAINER,
});

/** Filter/action strip above the list, separated by a hairline. */
export const toolbar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space['5'],
  paddingBottom: vars.space['6'],
  borderBottom: `1px solid ${vars.color.border.subtle}`,
  marginBottom: vars.space['7'],
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['7'],
  '@container': {
    [`${CONTAINER} (min-width: ${PANEL_BREAKPOINT})`]: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 400px',
      gap: vars.space['6'],
      alignItems: 'start',
      maxWidth: 1280,
    },
    [`${CONTAINER} (min-width: ${WIDE_BREAKPOINT})`]: {
      gridTemplateColumns: 'minmax(0, 1fr) 420px',
      gap: vars.space['8'],
      maxWidth: 1900,
    },
  },
});

export const listColumn = style({
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['6'],
});

/**
 * The sticky side panel. Hidden below the breakpoint rather than unmounted:
 * the same detail node renders here and in {@link inlineDetail}, and
 * `display: none` keeps the hidden copy out of the accessibility tree so the
 * user never meets two copies of the same form controls.
 */
export const detailColumn = style({
  display: 'none',
  '@container': {
    [`${CONTAINER} (min-width: ${PANEL_BREAKPOINT})`]: {
      display: 'block',
      position: 'sticky',
      top: vars.space['6'],
    },
  },
});

/** The same detail, expanded under its row — the narrow-container counterpart. */
export const inlineDetail = style({
  display: 'block',
  borderTop: `1px solid ${vars.color.border.default}`,
  background: vars.color.surface.app,
  padding: `${vars.space['5']} ${vars.space['6']}`,
  '@container': {
    [`${CONTAINER} (min-width: ${PANEL_BREAKPOINT})`]: { display: 'none' },
  },
});

/** Head strip of the detail panel; leans on the card head but adds its own rule. */
export const detailHead = style({
  borderBottom: `1px solid ${vars.color.border.subtle}`,
  paddingBottom: vars.space['5'],
});

export const detailContent = style({
  padding: vars.space['6'],
});

/** Trailing strip of the list card holding its "add a record" action. */
export const listFooter = style({
  borderTop: `1px solid ${vars.color.border.subtle}`,
  padding: `${vars.space['4']} ${vars.space['6']}`,
});

/** A list card's count is data, so its `Badge` wears the mono face. */
export const count = style({
  fontFamily: vars.font.mono,
});
