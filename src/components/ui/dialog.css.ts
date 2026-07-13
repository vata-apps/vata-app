/**
 * Dialog primitive styles — a Base UI `Dialog` assembly styled from the
 * warm-earth tokens.
 *
 * Provides a scrim backdrop and a rounded popup shell. The `layer` variant
 * picks the stacking level: `dialog` for a regular modal, `alert` for a
 * confirmation that must cover an already-open dialog and the selects and
 * popovers floating inside it. Width, padding, and internal layout are left to
 * the caller.
 */
import { recipe } from '@vanilla-extract/recipes';

import { primitive } from '$/design/primitive-layer';
import { vars } from '$/design/theme.css';

export const backdrop = recipe({
  base: primitive({
    position: 'fixed',
    inset: 0,
    background: vars.color.scrim,
  }),
  variants: {
    layer: {
      dialog: primitive({ zIndex: vars.zIndex.dialogBackdrop }),
      alert: primitive({ zIndex: vars.zIndex.alertBackdrop }),
    },
  },
  defaultVariants: {
    layer: 'dialog',
  },
});

export const popup = recipe({
  base: primitive({
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontFamily: vars.font.sans,
    color: vars.color.text,
    background: vars.color.panel,
    border: `1px solid ${vars.color.borderStrong}`,
    borderRadius: 14,
    boxShadow: vars.shadow.lg,
  }),
  variants: {
    layer: {
      dialog: primitive({ zIndex: vars.zIndex.dialog }),
      alert: primitive({ zIndex: vars.zIndex.alert }),
    },
  },
  defaultVariants: {
    layer: 'dialog',
  },
});
