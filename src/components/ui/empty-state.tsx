/**
 * EmptyState primitive — "nothing here yet", in the archivist's voice.
 *
 * Serif italic is Vata's "nothing recorded" signature: it reads as a note in
 * the margin rather than an error.
 */
import * as React from 'react';

import * as styles from './empty-state.css';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function EmptyState({ children, className = '', ...props }: EmptyStateProps): JSX.Element {
  return (
    <span className={`${styles.inline} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
