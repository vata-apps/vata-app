import { forwardRef, type InputHTMLAttributes } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

/**
 * HTML input types accepted by {@link Input}. Restricted to text-shaped
 * variants on purpose — non-text inputs (`number`, `date`, `file`,
 * `checkbox`, `radio`, `color`, `range`) have very different UX and a11y
 * needs, and will get their own dedicated wrappers when needed.
 */
export type InputTextType = 'text' | 'email' | 'url' | 'tel' | 'search' | 'password';

/**
 * Recipe for the Input component's visual variants.
 *
 * Sizes:
 * - `sm` — dense forms, inline filters.
 * - `md` — default form size.
 * - `lg` — primary onboarding fields, search hero.
 *
 * State:
 * - `default` — neutral border, accent ring on focus.
 * - `error` — red border + red focus ring. Pair with `aria-invalid` and an
 *   adjacent error message; the {@link InputProps.invalid} shortcut handles both.
 */
export const inputRecipe = tv({
  base: [
    'block w-full bg-card text-foreground placeholder:text-muted-foreground',
    'rounded-md border',
    'transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  variants: {
    size: {
      sm: 'h-7 px-2 text-xs',
      md: 'h-9 px-3 text-sm',
      lg: 'h-11 px-4 text-base',
    },
    state: {
      default: 'border-input focus-visible:ring-ring',
      error: 'border-destructive focus-visible:ring-destructive',
    },
  },
  defaultVariants: {
    size: 'md',
    state: 'default',
  },
});

type InputRecipeProps = VariantProps<typeof inputRecipe>;

/**
 * Props accepted by {@link Input}. Extends the native `<input>` props minus
 * `type` and `size` (both are tightened by this component).
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /**
   * Restricted set of HTML input types — text-shaped only. See
   * {@link InputTextType} for the full list.
   * Defaults to `"text"`.
   */
  type?: InputTextType;

  /**
   * Visual size of the input. Independent from the native `size` attribute,
   * which is intentionally not exposed here.
   * Defaults to `"md"`.
   */
  size?: InputRecipeProps['size'];

  /**
   * Marks the input as invalid for both assistive tech (`aria-invalid="true"`)
   * and visuals (red border + red focus ring). Use this whenever the field has
   * a known validation error so screen readers and sighted users see a
   * consistent signal.
   */
  invalid?: boolean;
}

/**
 * Single-line text input.
 *
 * Wraps a native `<input>` with the Vata visual system: tokenised colours,
 * focus ring, error state. Accessibility is delegated to the native element —
 * always associate the input with a `<label htmlFor="id">` (or wrap it in one);
 * for icon-only or compact contexts, `aria-label` is acceptable.
 *
 * Restricted to text-shaped types (`text`, `email`, `url`, `tel`, `search`,
 * `password`). Other input types will get dedicated wrappers when required.
 *
 * @example
 * // Standard labelled input
 * <label htmlFor="name">Name</label>
 * <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
 *
 * @example
 * // Email input with validation error
 * <label htmlFor="email">Email</label>
 * <Input id="email" type="email" invalid={!isValidEmail} aria-describedby="email-error" />
 * {!isValidEmail && <p id="email-error">Please enter a valid email address.</p>}
 *
 * @example
 * // Search input with placeholder
 * <Input type="search" placeholder="Search trees" aria-label="Search trees" />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { type = 'text', size, invalid = false, className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={inputRecipe({ size, state: invalid ? 'error' : 'default', className })}
      {...props}
    />
  );
});

Input.displayName = 'Input';
