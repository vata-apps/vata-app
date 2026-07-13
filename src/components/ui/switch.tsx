import type { ComponentPropsWithoutRef } from 'react';
import { Switch as BaseSwitch } from '@base-ui/react/switch';

import * as s from './switch.css';

type RootProps = Omit<ComponentPropsWithoutRef<typeof BaseSwitch.Root>, 'className'>;

/** The toggle track. Accepts all Base UI Switch.Root props except `className`. */
function Root({ children, ...props }: RootProps): JSX.Element {
  return (
    <BaseSwitch.Root className={s.root} {...props}>
      {children ?? <Thumb />}
    </BaseSwitch.Root>
  );
}

/** The sliding thumb inside the track. */
function Thumb(): JSX.Element {
  return <BaseSwitch.Thumb className={s.thumb} />;
}

/**
 * Accessible on/off toggle built on Base UI Switch (accessibility, keyboard,
 * focus management). Styled with the warm-earth track and thumb.
 *
 * ```tsx
 * <Switch.Root
 *   checked={isLiving}
 *   onCheckedChange={setIsLiving}
 *   aria-label="Deceased"
 * >
 *   <Switch.Thumb />
 * </Switch.Root>
 * ```
 */
export const Switch = { Root, Thumb };
