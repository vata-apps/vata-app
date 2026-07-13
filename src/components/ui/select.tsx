import type { ComponentPropsWithoutRef } from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';

import * as s from './select.css';

type TriggerProps = Omit<ComponentPropsWithoutRef<typeof BaseSelect.Trigger>, 'className'>;
type PositionerProps = Omit<ComponentPropsWithoutRef<typeof BaseSelect.Positioner>, 'className'>;
type PopupProps = Omit<ComponentPropsWithoutRef<typeof BaseSelect.Popup>, 'className'>;
type ItemProps = Omit<ComponentPropsWithoutRef<typeof BaseSelect.Item>, 'className'>;

/** Styled trigger button: the closed state of the select, showing the current value. */
function Trigger({ children, ...props }: TriggerProps): JSX.Element {
  return (
    <BaseSelect.Trigger className={s.trigger} {...props}>
      {children}
    </BaseSelect.Trigger>
  );
}

/** Chevron icon slot inside the trigger; auto-pushes to the right. */
function Icon({ children }: { children: React.ReactNode }): JSX.Element {
  return <BaseSelect.Icon className={s.caret}>{children}</BaseSelect.Icon>;
}

/** Positioned popup container; sets the z-index that escapes the dialog stacking context. */
function Positioner({ children, ...props }: PositionerProps): JSX.Element {
  return (
    <BaseSelect.Positioner className={s.positionerZ} {...props}>
      {children}
    </BaseSelect.Positioner>
  );
}

/** The dropdown popup panel. */
function Popup({ children, ...props }: PopupProps): JSX.Element {
  return (
    <BaseSelect.Popup className={s.popup} {...props}>
      {children}
    </BaseSelect.Popup>
  );
}

/** A single selectable option row. */
function Item({ children, ...props }: ItemProps): JSX.Element {
  return (
    <BaseSelect.Item className={s.item} {...props}>
      {children}
    </BaseSelect.Item>
  );
}

/**
 * Styled Base UI Select compound component. Wraps each Base UI Select part
 * with the warm-earth visual treatment (ADR-0015). Usage mirrors Base UI's API
 * exactly — only the `className` prop is omitted on each part.
 *
 * ```tsx
 * <Select.Root value={val} onValueChange={setVal}>
 *   <Select.Trigger>
 *     <Select.Value />
 *     <Select.Icon><ChevronDown /></Select.Icon>
 *   </Select.Trigger>
 *   <Select.Portal>
 *     <Select.Positioner sideOffset={4} positionMethod="fixed">
 *       <Select.Popup>
 *         <Select.Item value="a"><Select.ItemText>A</Select.ItemText></Select.Item>
 *       </Select.Popup>
 *     </Select.Positioner>
 *   </Select.Portal>
 * </Select.Root>
 * ```
 */
export const Select = {
  Root: BaseSelect.Root,
  Trigger,
  Value: BaseSelect.Value,
  Icon,
  Portal: BaseSelect.Portal,
  Positioner,
  Popup,
  Item,
  ItemText: BaseSelect.ItemText,
};
