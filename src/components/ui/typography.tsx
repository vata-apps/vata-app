/**
 * Typography primitive — a single polymorphic text component.
 *
 * Use the `as` prop to choose the semantic element (`p`, `h2`, `span`, etc.);
 * use `size`, `weight`, `tone`, and `family` to select styles from the token
 * contract. Keeping Text and Heading as one component matches ADR-0007: the
 * boundary between them is semantic, which is what `as` is for.
 *
 * Example:
 * ```tsx
 * <Typography as="h2" size="15" weight="650">
 *   Add person
 * </Typography>
 * ```
 */
import * as React from 'react';

import * as styles from './typography.css';

type TypographyElement = 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  /** Semantic element to render. */
  as?: TypographyElement;
  /** Type size from the token scale. */
  size?: '12.5' | '13' | '13.5' | '15' | '16';
  /** Font weight. */
  weight?: '400' | '500' | '550' | '600' | '650' | '700';
  /** Text color tone. */
  tone?: 'text' | 'muted' | 'faint' | 'accent' | 'danger' | 'warn';
  /** Font family. */
  family?: 'sans' | 'serif' | 'mono';
}

export function Typography({
  as: Component = 'span',
  size = '13',
  weight = '400',
  tone = 'text',
  family = 'sans',
  className = '',
  ...props
}: TypographyProps): JSX.Element {
  return (
    <Component
      className={`${styles.typography({ size, weight, tone, family })} ${className}`.trim()}
      {...props}
    />
  );
}
