/**
 * Select primitive — a styled Base UI `Select` assembly.
 *
 * Composes the same parts as Base UI (`Root`, `Trigger`, `Value`, `Icon`,
 * `Portal`, `Positioner`, `Popup`, `Item`, `ItemText`) but applies the
 * warm-earth trigger, popup, and item styles. Consumers drive it by role
 * (`combobox`, `option`) and label.
 *
 * Example:
 * ```tsx
 * <Select.Root value={value} onValueChange={setValue}>
 *   <Select.Trigger>
 *     <Select.Value />
 *     <Select.Icon><Icon name="chevron-down" size={12} /></Select.Icon>
 *   </Select.Trigger>
 *   <Select.Portal>
 *     <Select.Positioner sideOffset={4}>
 *       <Select.Popup>
 *         {options.map((o) => (
 *           <Select.Item key={o} value={o}>
 *             <Select.ItemText>{o}</Select.ItemText>
 *           </Select.Item>
 *         ))}
 *       </Select.Popup>
 *     </Select.Positioner>
 *   </Select.Portal>
 * </Select.Root>
 * ```
 */
import * as React from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';

import * as styles from './select.css';

function Trigger({ className = '', ...props }: React.ComponentProps<typeof BaseSelect.Trigger>) {
  return <BaseSelect.Trigger className={`${styles.trigger} ${className}`.trim()} {...props} />;
}

function Positioner({
  className = '',
  ...props
}: React.ComponentProps<typeof BaseSelect.Positioner>) {
  return (
    <BaseSelect.Positioner className={`${styles.positioner} ${className}`.trim()} {...props} />
  );
}

function Popup({ className = '', ...props }: React.ComponentProps<typeof BaseSelect.Popup>) {
  return <BaseSelect.Popup className={`${styles.popup} ${className}`.trim()} {...props} />;
}

function Item({ className = '', ...props }: React.ComponentProps<typeof BaseSelect.Item>) {
  return <BaseSelect.Item className={`${styles.item} ${className}`.trim()} {...props} />;
}

function Icon({ className = '', ...props }: React.ComponentProps<typeof BaseSelect.Icon>) {
  return <BaseSelect.Icon className={`${styles.caret} ${className}`.trim()} {...props} />;
}

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
