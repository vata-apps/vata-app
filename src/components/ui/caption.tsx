/**
 * Caption primitive — uppercase eyebrow label above a field group or
 * section (e.g. a form section title).
 */
import * as React from 'react';

import * as styles from './caption.css';

export interface CaptionProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function Caption({ children, className = '', ...props }: CaptionProps): JSX.Element {
  return (
    <span className={`${styles.caption} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
