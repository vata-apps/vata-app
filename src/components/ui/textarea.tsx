import { forwardRef, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

import { FieldWithHint, useFieldHint } from './field';

/**
 * Recipe for the Textarea. Mirrors `fieldRecipe` for colour/border/focus
 * tokens and overrides only the size variant so multi-line fields use
 * `min-h-` instead of a fixed `h-` (a textarea must be allowed to grow
 * vertically while staying tall enough at rest).
 *
 * Sizes:
 * - `sm` — dense forms (inline notes, filters).
 * - `md` — default — standard form notes.
 * - `lg` — long-form descriptions, biographies.
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
  const { fieldId, hintId, describedBy } = useFieldHint({
    id,
    hint,
    ariaDescribedBy,
    prefix: 'textarea',
  });

  const textarea = (
    <textarea
      ref={ref}
      id={fieldId}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={textareaRecipe({ size, state: invalid ? 'error' : 'default', className })}
      {...props}
    />
  );

  return <FieldWithHint field={textarea} hint={hint} hintId={hintId} />;
});

Textarea.displayName = 'Textarea';
