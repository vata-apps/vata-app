/**
 * Popover primitive — a styled Base UI `Popover` assembly.
 *
 * Exposes the same parts as Base UI (`Root`, `Trigger`, `Portal`, `Positioner`,
 * `Popup`, `Arrow`, `Close`) with warm-earth popup shell styles and the
 * correct positioner z-index for floating inside dialogs.
 *
 * Drive tests by the trigger button and the popup contents; assert that
 * opening/closing reveals or hides the expected options.
 */
import * as React from 'react';
import { Popover as BasePopover } from '@base-ui/react/popover';

import * as styles from './popover.css';

function Positioner({
  className = '',
  ...props
}: React.ComponentProps<typeof BasePopover.Positioner>) {
  return (
    <BasePopover.Positioner className={`${styles.positioner} ${className}`.trim()} {...props} />
  );
}

function Popup({ className = '', ...props }: React.ComponentProps<typeof BasePopover.Popup>) {
  return <BasePopover.Popup className={`${styles.popup} ${className}`.trim()} {...props} />;
}

export const Popover = {
  Root: BasePopover.Root,
  Trigger: BasePopover.Trigger,
  Portal: BasePopover.Portal,
  Positioner,
  Popup,
};
