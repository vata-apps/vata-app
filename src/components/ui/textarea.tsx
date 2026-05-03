import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Recipe for the Textarea component's visual variants.
 *
 * Sizes:
 * - `sm` — dense forms (inline notes, filters).
 * - `md` — default — standard form notes.
 * - `lg` — long-form descriptions, biographies.
 *
 * State:
 * - `default` — neutral border, accent ring on focus.
 * - `error` — red border + red focus ring; pair with `aria-invalid` and an
 *   adjacent error message. The {@link TextareaProps.invalid} shortcut
 *   handles both.
 */
export const textareaRecipe = tv({
  base: [
    'block w-full bg-card text-foreground placeholder:text-muted-foreground',
    'rounded-md border resize-y',
    'transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  variants: {
    size: {
      sm: 'min-h-[64px] px-2 py-1.5 text-xs',
      md: 'min-h-[88px] px-3 py-2 text-sm',
      lg: 'min-h-[112px] px-4 py-2.5 text-base',
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

type TextareaRecipeProps = VariantProps<typeof textareaRecipe>;

/**
 * Props accepted by {@link Textarea}. Extends the native `<textarea>` props
 * minus `size` (which is reused for visual sizing here).
 */
export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /**
   * Visual size of the textarea. Independent from the native `cols`/`rows`
   * attributes. Defaults to `"md"`.
   */
  size?: TextareaRecipeProps['size'];

  /**
   * Marks the textarea as invalid for both assistive tech (`aria-invalid`)
   * and visuals (red border + red focus ring).
   */
  invalid?: boolean;

  /**
   * Optional help text rendered below the field. When provided, the
   * textarea is wrapped in a small block container and `aria-describedby`
   * is wired so assistive tech announces the hint after the field's
   * accessible name. Pass localized content from the consumer.
   */
  hint?: ReactNode;
}

/**
 * Multi-line text input.
 *
 * Wraps a native `<textarea>` with the Vata visual system: tokenised
 * colours, focus ring, error state. Accessibility is delegated to the
 * native element — always associate the textarea with a `<label htmlFor>`
 * (or wrap it in one).
 *
 * @example
 * <label htmlFor="description">Description</label>
 * <Textarea id="description" rows={4} value={value} onChange={(e) => setValue(e.target.value)} />
 *
 * @example
 * // Long-form input with validation error
 * <Textarea
 *   size="lg"
 *   invalid={!!error}
 *   hint={t('individuals.description.hint')}
 * />
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { size, invalid = false, hint, className, id, 'aria-describedby': ariaDescribedBy, ...props },
  ref
) {
  const reactId = useId();
  const textareaId = id ?? (hint ? `textarea-${reactId}` : undefined);
  const hintId = hint ? `${textareaId}-hint` : undefined;
  const describedBy = [ariaDescribedBy, hintId].filter(Boolean).join(' ') || undefined;

  const textarea = (
    <textarea
      ref={ref}
      id={textareaId}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={textareaRecipe({ size, state: invalid ? 'error' : 'default', className })}
      {...props}
    />
  );

  if (!hint) {
    return textarea;
  }

  return (
    <div className="block">
      {textarea}
      <p id={hintId} className="text-muted-foreground mt-1 text-xs">
        {hint}
      </p>
    </div>
  );
});

Textarea.displayName = 'Textarea';
