/**
 * Tooltip primitive — a styled Base UI `Tooltip` assembly.
 *
 * Exposes `Root`, `Trigger`, `Portal`, `Positioner`, and `Popup` with the
 * grayscale popup shell styles. Wrap a single trigger element per `Root` —
 * there is no shared `Provider` yet, so tooltips don't share an open delay
 * across a group.
 *
 * @example
 * <Tooltip.Root>
 *   <Tooltip.Trigger render={<button>...</button>} />
 *   <Tooltip.Portal>
 *     <Tooltip.Positioner side="right">
 *       <Tooltip.Popup>Label</Tooltip.Popup>
 *     </Tooltip.Positioner>
 *   </Tooltip.Portal>
 * </Tooltip.Root>
 */
import * as React from 'react';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';

import * as styles from './tooltip.css';

function Positioner({
  className = '',
  ...props
}: React.ComponentProps<typeof BaseTooltip.Positioner>) {
  return (
    <BaseTooltip.Positioner className={`${styles.positioner} ${className}`.trim()} {...props} />
  );
}

function Popup({ className = '', ...props }: React.ComponentProps<typeof BaseTooltip.Popup>) {
  return <BaseTooltip.Popup className={`${styles.popup} ${className}`.trim()} {...props} />;
}

export const Tooltip = {
  Root: BaseTooltip.Root,
  Trigger: BaseTooltip.Trigger,
  Portal: BaseTooltip.Portal,
  Positioner,
  Popup,
};
