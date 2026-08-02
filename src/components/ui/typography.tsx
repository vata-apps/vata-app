/**
 * Typography primitive — a single polymorphic text component.
 *
 * Use the `as` prop to choose the semantic element (`p`, `h2`, `span`, etc.);
 * use `size`, `weight`, `tone`, and `family` to select styles from the token
 * contract. Keeping Text and Heading as one component matches ADR-0005: the
 * boundary between them is semantic, which is what `as` is for.
 *
 * Example:
 * ```tsx
 * <Typography as="h2" size="md" weight="strong">
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
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  /** Font weight. */
  weight?: 'regular' | 'medium' | 'semibold' | 'strong' | 'bold';
  /** Text color tone. */
  tone?: 'body' | 'muted' | 'subtle' | 'brand' | 'danger' | 'warn';
  /** Font family. `serif` is reserved for person names, drafts and empty states. */
  family?: 'sans' | 'serif' | 'mono';
}

export function Typography({
  as: Component = 'span',
  size = 'sm',
  weight = 'regular',
  tone = 'body',
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
