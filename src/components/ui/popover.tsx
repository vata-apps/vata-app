import type { ComponentPropsWithoutRef } from 'react';
import { Popover as BasePopover } from '@base-ui/react/popover';

import * as s from './popover.css';

type PositionerProps = Omit<ComponentPropsWithoutRef<typeof BasePopover.Positioner>, 'className'>;
type PopupProps = ComponentPropsWithoutRef<typeof BasePopover.Popup>;

/** Positioned container; sets the z-index that escapes the dialog stacking context. */
function Positioner({ children, ...props }: PositionerProps): JSX.Element {
  return (
    <BasePopover.Positioner className={s.positionerZ} {...props}>
      {children}
    </BasePopover.Positioner>
  );
}

/**
 * The floating popup panel. Provides the base chrome (surface, border, shadow,
 * radius); consumers add sizing via `className`.
 */
function Popup({ className, children, ...props }: PopupProps): JSX.Element {
  const cls = [s.popup, className].filter(Boolean).join(' ');
  return (
    <BasePopover.Popup className={cls} {...props}>
      {children}
    </BasePopover.Popup>
  );
}

/**
 * Styled Base UI Popover compound component (ADR-0015). Wraps Base UI Popover
 * parts with warm-earth chrome. `Positioner` handles z-index; `Popup` provides
 * the base panel look. Consumers size via `className` on `Popup`.
 *
 * ```tsx
 * <Popover.Root open={open} onOpenChange={setOpen}>
 *   <Popover.Trigger>Open</Popover.Trigger>
 *   <Popover.Portal>
 *     <Popover.Positioner sideOffset={6} positionMethod="fixed">
 *       <Popover.Popup className={s.myPanel}>…content…</Popover.Popup>
 *     </Popover.Positioner>
 *   </Popover.Portal>
 * </Popover.Root>
 * ```
 */
export const Popover = {
  Root: BasePopover.Root,
  Portal: BasePopover.Portal,
  Trigger: BasePopover.Trigger,
  Positioner,
  Popup,
};
