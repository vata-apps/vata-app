import { useId, type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Recipe shared by all single-element form fields (Input, Textarea
 * trigger style, Select trigger). Owns the colour, border, focus-ring,
 * and disabled tokens. Per-field wrappers extend it for size-specific
 * dimensions (height vs min-height, padding) since textareas need
 * `min-h-` while inputs/selects use a fixed `h-`.
 */
export const fieldRecipe = tv({
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

export type FieldRecipeProps = VariantProps<typeof fieldRecipe>;

/**
 * Wires the `aria-describedby` association between a field and its
 * optional hint. Generates a stable id pair when the caller hasn't
 * supplied one, and merges any caller-supplied `aria-describedby` so
 * the hint id is appended rather than overwritten.
 *
 * Returns `hintId === undefined` when no hint is set, signalling that
 * the consumer should render the field bare (no wrapping div, no hint
 * paragraph).
 */
export function useFieldHint({
  id,
  hint,
  ariaDescribedBy,
  prefix,
}: {
  id?: string;
  hint?: ReactNode;
  ariaDescribedBy?: string;
  prefix: string;
}) {
  const reactId = useId();
  const fieldId = id ?? `${prefix}-${reactId}`;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const describedBy = [ariaDescribedBy, hintId].filter(Boolean).join(' ') || undefined;
  return { fieldId, hintId, describedBy };
}

/**
 * Wraps a field element with its hint paragraph. Returns the field as-is
 * when no hint is set so consumers don't pay a wrapper div for the
 * common case.
 */
export function FieldWithHint({
  field,
  hint,
  hintId,
}: {
  field: ReactNode;
  hint: ReactNode;
  hintId: string | undefined;
}) {
  if (!hint) {
    return <>{field}</>;
  }
  return (
    <div className="flex flex-col gap-1">
      {field}
      <p id={hintId} className="text-muted-foreground text-xs">
        {hint}
      </p>
    </div>
  );
}
