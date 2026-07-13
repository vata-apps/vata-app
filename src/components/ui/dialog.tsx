import type { ComponentPropsWithoutRef } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';

import { backdrop as backdropRecipe, popup as popupRecipe } from './dialog.css';

type BackdropLevel = 'base' | 'elevated';
type PopupVariant = 'panel' | 'alert';

type BackdropProps = Omit<ComponentPropsWithoutRef<typeof BaseDialog.Backdrop>, 'className'> & {
  level?: BackdropLevel;
};

type PopupProps = Omit<ComponentPropsWithoutRef<typeof BaseDialog.Popup>, 'className'> & {
  variant?: PopupVariant;
  className?: string;
};

/** Scrim overlay behind the dialog. `level` controls z-index for nested dialogs. */
function Backdrop({ level = 'base', ...props }: BackdropProps): JSX.Element {
  return <BaseDialog.Backdrop className={backdropRecipe({ level })} {...props} />;
}

/**
 * The dialog panel itself. `variant="panel"` (default) is a large flex-column
 * editor; `variant="alert"` is a small padded confirmation prompt.
 */
function Popup({ variant = 'panel', className, ...props }: PopupProps): JSX.Element {
  const cls = [popupRecipe({ variant }), className].filter(Boolean).join(' ');
  return <BaseDialog.Popup className={cls} {...props} />;
}

/**
 * Styled Base UI Dialog compound component. Wraps each Base UI Dialog part
 * with the warm-earth visual treatment (ADR-0015). `Root`, `Portal`, `Title`,
 * and `Description` are direct re-exports; `Backdrop` and `Popup` add
 * variant-aware styling.
 *
 * ```tsx
 * <Dialog.Root open={open} onOpenChange={setOpen}>
 *   <Dialog.Portal>
 *     <Dialog.Backdrop />
 *     <Dialog.Popup variant="alert">
 *       <Dialog.Title>Confirm?</Dialog.Title>
 *       <Dialog.Description>This cannot be undone.</Dialog.Description>
 *     </Dialog.Popup>
 *   </Dialog.Portal>
 * </Dialog.Root>
 * ```
 */
export const Dialog = {
  Root: BaseDialog.Root,
  Portal: BaseDialog.Portal,
  Backdrop,
  Popup,
  Title: BaseDialog.Title,
  Description: BaseDialog.Description,
};
