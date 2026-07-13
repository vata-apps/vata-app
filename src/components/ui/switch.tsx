/**
 * Switch primitive — a styled Base UI `Switch` assembly.
 *
 * Use for binary on/off states. The `checked`, `onCheckedChange`, `disabled`,
 * and `aria-label` props are forwarded to Base UI, which supplies the
 * `switch` role, keyboard activation, and focus handling.
 */
import * as React from 'react';
import { Switch as BaseSwitch } from '@base-ui/react/switch';

import * as styles from './switch.css';

function Root({ className = '', ...props }: React.ComponentProps<typeof BaseSwitch.Root>) {
  return <BaseSwitch.Root className={`${styles.root} ${className}`.trim()} {...props} />;
}

function Thumb({ className = '', ...props }: React.ComponentProps<typeof BaseSwitch.Thumb>) {
  return <BaseSwitch.Thumb className={`${styles.thumb} ${className}`.trim()} {...props} />;
}

export const Switch = {
  Root,
  Thumb,
};
