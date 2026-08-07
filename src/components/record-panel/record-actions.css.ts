import { style } from '@vanilla-extract/css';

import { vars } from '$/design/theme.css';

/** Styles for {@link ./record-actions}: the draft footer and the inline delete. */

/** Separates a trailing action strip from the fields above it. */
const section = style({
  borderTop: `1px solid ${vars.color.border.subtle}`,
  paddingTop: vars.space['5'],
});

export const draftFooter = style([
  section,
  {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: vars.space['4'],
    borderTopColor: vars.color.border.default,
  },
]);

/** "Not saved" sits at the far left, pushing the two actions to the right. */
export const draftStatus = style({
  flex: 1,
  minWidth: 0,
});

export const deleteSection = style([section]);

/**
 * Idle delete control: an outlined neutral button that only takes on the error
 * tone under the pointer, so a destructive action is never the loudest thing
 * in the panel until the user reaches for it.
 */
export const deleteTrigger = style({
  borderColor: vars.color.border.default,
  background: vars.color.surface.card,
  selectors: {
    '&:hover:not(:disabled)': {
      borderColor: `color-mix(in srgb, ${vars.color.status.err.bg} 45%, transparent)`,
      color: vars.color.status.err.text,
      background: `color-mix(in srgb, ${vars.color.status.err.bg} 10%, transparent)`,
    },
  },
});

/** The confirmation bar that replaces the trigger in place — never a modal. */
export const confirmBar = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['4'],
  padding: `${vars.space['4']} ${vars.space['5']}`,
  border: `1px solid color-mix(in srgb, ${vars.color.status.err.bg} 40%, transparent)`,
  borderRadius: vars.radius.sm,
  background: `color-mix(in srgb, ${vars.color.status.err.bg} 7%, transparent)`,
});

export const confirmQuestion = style({
  flex: 1,
  minWidth: 0,
});
