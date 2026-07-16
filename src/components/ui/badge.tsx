/**
 * Badge primitive — a compact, non-interactive status token.
 *
 * Use for category tags, role labels, and other read-only pills.
 */
import * as React from 'react';

import * as styles from './badge.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function Badge({ children, className = '', ...props }: BadgeProps): JSX.Element {
  return (
    <span className={`${styles.badge} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
