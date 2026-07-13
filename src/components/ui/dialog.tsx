/**
 * Dialog primitive — a styled Base UI `Dialog` assembly.
 *
 * Exposes the same parts as Base UI (`Root`, `Trigger`, `Portal`, `Backdrop`,
 * `Popup`, `Title`, `Description`, `Close`) with warm-earth backdrop and popup
 * shell styles. Width, padding, and internal layout are left to the caller so
 * the primitive works for both large modals and small confirmation dialogs.
 *
 * Pass `layer="alert"` to both `Backdrop` and `Popup` when the dialog is a
 * confirmation opened from an already-open dialog: it stacks above that
 * dialog and above any select/popover floating inside it. The default,
 * `layer="dialog"`, is the right choice for a top-level modal.
 *
 * Drive tests by `dialog` / `alertdialog` roles and the title/description text.
 */
import * as React from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';

import * as styles from './dialog.css';

/** Stacking level; see the module JSDoc. */
export type DialogLayer = 'dialog' | 'alert';

type BackdropProps = React.ComponentProps<typeof BaseDialog.Backdrop> & { layer?: DialogLayer };

function Backdrop({ className = '', layer = 'dialog', ...props }: BackdropProps) {
  return (
    <BaseDialog.Backdrop
      className={`${styles.backdrop({ layer })} ${className}`.trim()}
      {...props}
    />
  );
}

type PopupProps = React.ComponentProps<typeof BaseDialog.Popup> & { layer?: DialogLayer };

function Popup({ className = '', layer = 'dialog', ...props }: PopupProps) {
  return (
    <BaseDialog.Popup className={`${styles.popup({ layer })} ${className}`.trim()} {...props} />
  );
}

export const Dialog = {
  Root: BaseDialog.Root,
  Trigger: BaseDialog.Trigger,
  Portal: BaseDialog.Portal,
  Backdrop,
  Popup,
  Title: BaseDialog.Title,
  Description: BaseDialog.Description,
  Close: BaseDialog.Close,
};
