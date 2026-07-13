/**
 * Dialog primitive — a styled Base UI `Dialog` assembly.
 *
 * Exposes the same parts as Base UI (`Root`, `Trigger`, `Portal`, `Backdrop`,
 * `Popup`, `Title`, `Description`, `Close`) with warm-earth backdrop and popup
 * shell styles. Width, padding, and internal layout are left to the caller so
 * the primitive works for both large modals and small confirmation dialogs.
 *
 * Drive tests by `dialog` / `alertdialog` roles and the title/description text.
 */
import * as React from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';

import * as styles from './dialog.css';

function Backdrop({ className = '', ...props }: React.ComponentProps<typeof BaseDialog.Backdrop>) {
  return <BaseDialog.Backdrop className={`${styles.backdrop} ${className}`.trim()} {...props} />;
}

function Popup({ className = '', ...props }: React.ComponentProps<typeof BaseDialog.Popup>) {
  return <BaseDialog.Popup className={`${styles.popup} ${className}`.trim()} {...props} />;
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
