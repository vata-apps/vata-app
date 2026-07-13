import type { ComponentPropsWithoutRef, ElementType } from 'react';

import { typography as typographyRecipe } from './typography.css';

type Size = 'xs' | 'sm' | 'base' | 'md' | 'lg';
type Weight = 'normal' | 'medium' | 'semibold' | 'bold';
type Tone = 'default' | 'muted' | 'faint' | 'accent' | 'danger';
type Family = 'sans' | 'serif' | 'mono';

type TypographyOwnProps<E extends ElementType = 'span'> = {
  /** The element to render. Defaults to `span`. Use for semantic meaning — `h1`–`h6` for headings, `p` for paragraphs. */
  as?: E;
  size?: Size;
  weight?: Weight;
  tone?: Tone;
  family?: Family;
  className?: string;
};

type TypographyProps<E extends ElementType = 'span'> = TypographyOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof TypographyOwnProps<E>>;

/**
 * Polymorphic text component. Renders any element via `as` and applies the
 * warm-earth type scale through variant props, so every text surface in the
 * app stays on the same typed token contract.
 *
 * The `as` prop carries semantic meaning (heading level, paragraph, label);
 * `size` / `weight` / `tone` / `family` carry visual meaning — keep them
 * separate and intentional.
 *
 * ```tsx
 * <Typography as="h2" size="lg" weight="bold">Section title</Typography>
 * <Typography as="p" tone="muted">Secondary text</Typography>
 * <Typography as="span" family="serif" size="md">Fraunces signature</Typography>
 * ```
 */
export function Typography<E extends ElementType = 'span'>({
  as,
  size,
  weight,
  tone,
  family,
  className,
  ...rest
}: TypographyProps<E>): JSX.Element {
  const Component = (as ?? 'span') as ElementType;
  const cls = [typographyRecipe({ size, weight, tone, family }), className]
    .filter(Boolean)
    .join(' ');
  return <Component className={cls} {...rest} />;
}
