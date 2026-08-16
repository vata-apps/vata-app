/**
 * Tooltip primitive — a styled Base UI `Tooltip` assembly.
 *
 * Exposes `Root`, `Trigger`, `Portal`, `Positioner`, `Popup`, and
 * `createHandle` with the grayscale popup shell styles. Wrap a single
 * trigger element per `Root` — there is no shared `Provider` yet, so
 * tooltips don't share an open delay across a group.
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
 *
 * For a list where every item would otherwise mount its own `Tooltip.Root`
 * (its own floating-UI context and portal), share one instead: create a
 * handle once, give each item a detached `Tooltip.Trigger` carrying that
 * `handle` and a `payload`, and mount a single `Tooltip.Root handle={handle}`
 * whose function-as-child reads the hovered item's payload.
 *
 * @example
 * const rowTooltip = Tooltip.createHandle<Row>();
 * // per row:
 * <Tooltip.Trigger handle={rowTooltip} payload={row} render={<a>...</a>} />
 * // once, outside the list:
 * <Tooltip.Root handle={rowTooltip}>
 *   {({ payload }) => payload && (
 *     <Tooltip.Portal>
 *       <Tooltip.Positioner side="right">
 *         <Tooltip.Popup>{payload.label}</Tooltip.Popup>
 *       </Tooltip.Positioner>
 *     </Tooltip.Portal>
 *   )}
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
  createHandle: BaseTooltip.createHandle,
};
