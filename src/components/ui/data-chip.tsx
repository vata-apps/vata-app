/**
 * DataChip primitive — a small outlined chip carrying a date or year next to
 * an event title. Not a status pill — see {@link ../badge} for that.
 */
import * as React from 'react';

import * as styles from './data-chip.css';

export interface DataChipProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function DataChip({ children, className = '', ...props }: DataChipProps): JSX.Element {
  return (
    <span className={`${styles.dataChip} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
