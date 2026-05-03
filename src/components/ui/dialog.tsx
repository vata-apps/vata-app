import * as RadixDialog from '@radix-ui/react-dialog';
import { type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

import { Button } from './button';

/**
 * Recipe for the Dialog content's visual variants.
 *
 * Sizes:
 * - `sm` — confirm/cancel prompts, simple destructive flows.
 * - `md` — default — single-form modals (rename, edit metadata).
 * - `lg` — multi-section modals with toggles, file pickers, or grids.
 *
 * The recipe only sizes the floating shell; the overlay, the header, and the
 * footer are styled directly in the component because they don't vary.
 */
export const dialogContentRecipe = tv({
  base: [
    'bg-popover text-popover-foreground shadow-lg',
    'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
    'w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)] overflow-auto',
    'rounded-lg border border-border',
    'flex flex-col',
    'focus:outline-none',
  ],
  variants: {
    size: {
      sm: 'max-w-[400px]',
      md: 'max-w-[520px]',
      lg: 'max-w-[720px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

type DialogRecipeProps = VariantProps<typeof dialogContentRecipe>;

/**
 * Props accepted by {@link Dialog}.
 */
export interface DialogProps {
  /** Whether the dialog is open. Controlled by the consumer. */
  open: boolean;

  /**
   * Called when the open state should change — Radix invokes this on
   * Escape, click outside, and the close button.
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Localized dialog title rendered in the header. Required for
   * accessibility — Radix sets `aria-labelledby` to its node id.
   */
  title: ReactNode;

  /**
   * Optional localized description rendered under the title. When
   * provided, Radix wires it via `aria-describedby` on the dialog content.
   */
  description?: ReactNode;

  /** Body content of the dialog. */
  children: ReactNode;

  /**
   * Optional footer slot — typically a row of action buttons (Cancel
   * + primary CTA). Rendered with right-aligned actions; pair with
   * {@link DialogProps.footerNote} for any left-aligned context text.
   */
  footer?: ReactNode;

  /**
   * Optional left-aligned text in the footer (e.g. "File generated
   * locally"). Has no effect when {@link DialogProps.footer} is omitted.
   */
  footerNote?: ReactNode;

  /**
   * Visual size of the dialog. Defaults to `"md"`.
   */
  size?: DialogRecipeProps['size'];

  /**
   * Localized accessible name for the close button. Required (no
   * default) so a missing translation never ships English to end users.
   */
  closeLabel: string;
}

/**
 * Modal dialog primitive built on `@radix-ui/react-dialog`.
 *
 * Provides the chrome shared by every modal in the app: backdrop, centered
 * popover surface, header (title + optional description + close button),
 * body and optional footer. Focus trap, Escape, click-outside, and ARIA
 * wiring are delegated to Radix.
 *
 * The component is fully controlled — pass `open` and `onOpenChange` from
 * the parent. All textual content (`title`, `description`, `footer`,
 * `closeLabel`) must be localized by the caller; this primitive does not
 * own copy.
 *
 * @example
 * // Confirm modal
 * <Dialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   size="sm"
 *   title={t('individuals.delete.title')}
 *   description={t('individuals.delete.description')}
 *   footer={
 *     <>
 *       <Button variant="ghost" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
 *       <Button variant="destructive" onClick={onConfirm}>{t('common.delete')}</Button>
 *     </>
 *   }
 *   closeLabel={t('common.close')}
 * >
 *   <p>{t('individuals.delete.body')}</p>
 * </Dialog>
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  footerNote,
  size,
  closeLabel,
}: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm" />
        <RadixDialog.Content className={dialogContentRecipe({ size })} aria-describedby={undefined}>
          <header className="flex items-start justify-between gap-3 border-b border-border px-6 py-4">
            <div className="flex flex-col gap-1">
              <RadixDialog.Title className="text-foreground text-base font-semibold leading-tight">
                {title}
              </RadixDialog.Title>
              {description && (
                <RadixDialog.Description className="text-muted-foreground text-sm">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close asChild>
              <Button variant="ghost" size="sm" hideLabel leadingIcon="x">
                {closeLabel}
              </Button>
            </RadixDialog.Close>
          </header>

          <div className="flex flex-col gap-4 px-6 py-5">{children}</div>

          {footer && (
            <footer className="flex items-center justify-between gap-3 border-t border-border px-6 py-4">
              {footerNote ? (
                <div className="text-muted-foreground text-xs">{footerNote}</div>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">{footer}</div>
            </footer>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
