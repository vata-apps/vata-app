/**
 * Card primitive — shared panel chrome for entity-detail sections.
 *
 * A single wrapping element with no compound sub-parts: consumers place their
 * own heading and content inside, the same usage pattern as the Radix `Card`
 * it replaces.
 *
 * Use `layout` to choose how the card carries its padding:
 * - `box` (default): the card is padded and the consumer fills it freely.
 * - `sectioned`: the card has no padding of its own, so a `card.head` strip and
 *   `card.row` children run edge to edge and their hairlines span its width.
 */
import * as React from 'react';

import * as styles from './card.css';
import { Typography } from './typography';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** How the card carries its padding. */
  layout?: 'box' | 'sectioned';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ layout = 'box', className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={`${styles.card({ layout })} ${className}`.trim()} {...props} />
    );
  }
);
Card.displayName = 'Card';

/**
 * The head strip of a `layout="sectioned"` Card: the section title, then
 * whatever the caller puts beside it — a count badge next to the title, a
 * trailing action pinned to the far edge (its own class carries
 * `margin-left: auto`).
 */
export function PanelHead({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}): JSX.Element {
  return (
    <div className={styles.head}>
      <Typography as="h2" size="md" weight="strong">
        {title}
      </Typography>
      {children}
    </div>
  );
}
