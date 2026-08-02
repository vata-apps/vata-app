/**
 * Popover primitive — a styled Base UI `Popover` assembly.
 *
 * Exposes `Root`, `Trigger`, `Portal`, `Positioner`, `Popup`, and `Close`
 * (a square icon-button-styled close trigger) with the grayscale popup shell
 * styles and the correct positioner z-index for floating inside dialogs.
 * Base UI's remaining parts (`Arrow`, …) are not re-exported yet — add them
 * here, styled, when a screen needs one.
 *
 * Drive tests by the trigger button and the popup contents; assert that
 * opening/closing reveals or hides the expected options.
 */
import * as React from 'react';
import { Popover as BasePopover } from '@base-ui/react/popover';

import { iconButton } from './icon-button.css';
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

function Close({ className = '', ...props }: React.ComponentProps<typeof BasePopover.Close>) {
  return (
    <BasePopover.Close
      className={`${iconButton({ size: 'md', active: false })} ${className}`.trim()}
      {...props}
    />
  );
}

export const Popover = {
  Root: BasePopover.Root,
  Trigger: BasePopover.Trigger,
  Portal: BasePopover.Portal,
  Positioner,
  Popup,
  Close,
};
