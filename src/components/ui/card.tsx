/**
 * Card primitive — shared panel chrome for entity-detail sections.
 *
 * A single wrapping element with no compound sub-parts: consumers place their
 * own heading and content inside, the same usage pattern as the Radix `Card`
 * it replaces.
 */
import * as React from 'react';

import * as styles from './card.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', ...props }, ref) => {
    return <div ref={ref} className={`${styles.card} ${className}`.trim()} {...props} />;
  }
);
Card.displayName = 'Card';
