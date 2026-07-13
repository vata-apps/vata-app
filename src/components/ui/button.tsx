import type { ComponentPropsWithoutRef } from 'react';

import { button } from './button.css';

type Variant = 'solid' | 'ghost' | 'danger' | 'icon' | 'add';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  /** Visual variant. Defaults to `solid`. */
  variant?: Variant;
}

/**
 * General-purpose button. Wraps a native `<button>` and applies the warm-earth
 * variant recipe — no behavior beyond what the browser supplies.
 *
 * Variants:
 * - `solid`  — primary CTA (terracotta fill)
 * - `ghost`  — secondary / cancel (transparent, muted text)
 * - `danger` — destructive action (danger fill)
 * - `icon`   — icon-only square (30 × 30, transparent)
 * - `add`    — dashed "+ Add …" trigger (32px, dashed border)
 *
 * All native button attributes (`type`, `form`, `disabled`, `aria-*`) pass through.
 */
export function Button({
  variant = 'solid',
  type = 'button',
  className,
  ...props
}: ButtonProps): JSX.Element {
  const cls = [button({ variant }), className].filter(Boolean).join(' ');
  return <button type={type} className={cls} {...props} />;
}
