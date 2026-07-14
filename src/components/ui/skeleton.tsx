/**
 * Skeleton primitive — a pulsing placeholder block for loading states.
 *
 * Sized by the caller via `className` or `style`. The default height is one
 * line of text, so it fits naturally into table cells and form fields.
 */
import * as React from 'react';

import * as styles from './skeleton.css';

export interface SkeletonProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const Skeleton = React.forwardRef<HTMLSpanElement, SkeletonProps>(
  ({ className = '', style, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`${styles.skeleton} ${className}`.trim()}
        style={style}
        aria-hidden="true"
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';
