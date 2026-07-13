/**
 * Dialog styles — backdrop and popup recipes for Base UI Dialog panels
 * (ADR-0015). Two popup variants: `panel` for large editor dialogs, `alert`
 * for small confirmation prompts.
 */
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '$/design/theme.css';

export const backdrop = recipe({
  base: {
    position: 'fixed',
    inset: 0,
    background: vars.color.scrim,
  },
  variants: {
    /** Stacking level: `base` sits under `elevated` (used when two dialogs nest). */
    level: {
      base: { zIndex: 100 },
      elevated: { zIndex: 110 },
    },
  },
  defaultVariants: { level: 'base' },
});

export const popup = recipe({
  base: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'calc(100vw - 44px)',
    fontFamily: vars.font.sans,
    color: vars.color.text,
    background: vars.color.panel,
    border: `1px solid ${vars.color.borderStrong}`,
    boxShadow: vars.shadow.lg,
  },
  variants: {
    /** Size variant matching the use case. */
    variant: {
      /** Large editor / sheet dialog with flex column layout. */
      panel: {
        maxWidth: 1180,
        borderRadius: 14,
        zIndex: 101,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        maxHeight: 'calc(100vh - 54px)',
      },
      /** Small confirmation / alert prompt. */
      alert: {
        maxWidth: 440,
        borderRadius: 12,
        zIndex: 111,
        padding: 20,
      },
    },
  },
  defaultVariants: { variant: 'panel' },
});
