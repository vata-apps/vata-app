import { Slot } from '@radix-ui/react-slot';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Recipe for the Button component's visual variants and sizes.
 *
 * Variants describe the *intent* of the button, not just its appearance:
 * - `primary` — main call-to-action on a screen. One per view, ideally.
 * - `secondary` — supporting action paired with a primary (e.g., "Cancel" next to "Save").
 * - `outline` — neutral action with stronger affordance than `ghost`. Useful in toolbars.
 * - `ghost` — low-emphasis action; blends into the surface until hovered.
 * - `destructive` — irreversible or data-losing action ("Remove", "Delete").
 * - `link` — inline navigation styled as a link, with no chrome.
 *
 * Sizes:
 * - `sm` — dense rows, secondary toolbars.
 * - `md` — default size for most buttons.
 * - `lg` — hero CTAs, empty states.
 * - `icon` — square button, used with an aria-label and a single icon child.
 */
export const buttonRecipe = tv({
  base: [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-md font-medium leading-none',
    'transition-colors transition-transform duration-150 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:translate-y-px',
  ],
  variants: {
    variant: {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline:
        'border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
      ghost: 'bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground',
      destructive:
        'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80',
      link: 'bg-transparent text-primary underline underline-offset-4 hover:no-underline active:translate-y-0',
    },
    size: {
      sm: 'h-7 px-2.5 text-xs',
      md: 'h-9 px-3.5 text-sm',
      lg: 'h-11 px-5 text-base',
      icon: 'h-8 w-8 p-0',
    },
  },
  compoundVariants: [
    /* `link` ignores size dimensions — it lays out inline like text. */
    {
      variant: 'link',
      size: ['sm', 'md', 'lg', 'icon'],
      class: 'h-auto w-auto p-0',
    },
  ],
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

type ButtonRecipeProps = VariantProps<typeof buttonRecipe>;

/**
 * Props accepted by {@link Button}. Extends the native `<button>` props plus
 * recipe variants and the `asChild` polymorphism flag.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonRecipeProps {
  /**
   * Visual intent of the button. See {@link buttonRecipe} for semantics.
   * Defaults to `"primary"`.
   */
  variant?: ButtonRecipeProps['variant'];

  /**
   * Size of the button. Use `"icon"` for square icon-only buttons (always pair
   * with `aria-label`). Defaults to `"md"`.
   */
  size?: ButtonRecipeProps['size'];

  /**
   * When `true`, the Button does not render its own `<button>`: it renders the
   * single child element instead, forwarding all props (including click handlers
   * and styling) to it. Use this to style links, router `<Link>` elements, or
   * any custom interactive element with the Button look — without nesting an
   * `<a>` inside a `<button>`, which is invalid HTML.
   *
   * @example
   * <Button asChild variant="outline">
   *   <Link to="/trees/new">New tree</Link>
   * </Button>
   */
  asChild?: boolean;
}

/**
 * Primary interactive control of the app.
 *
 * Wraps a native `<button>` (or, with `asChild`, any single element) with the
 * Vata visual system: tokenised colours, focus rings, hover/active feedback.
 * Accessibility is delegated to the underlying element — the button stays
 * focusable, keyboard-activable, and announces correctly to screen readers.
 *
 * Defaults to `type="button"` so it never submits a surrounding form
 * unintentionally; pass `type="submit"` explicitly inside forms.
 *
 * @example
 * // Primary action
 * <Button onClick={handleSave}>Save</Button>
 *
 * @example
 * // Destructive action
 * <Button variant="destructive" onClick={handleDelete}>Remove</Button>
 *
 * @example
 * // Icon-only button (always provide aria-label)
 * <Button size="icon" variant="ghost" aria-label="Close">
 *   <XIcon />
 * </Button>
 *
 * @example
 * // Polymorphic — render a router link with button styling
 * <Button asChild>
 *   <Link to="/trees/new">New tree</Link>
 * </Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, asChild = false, className, type, ...props },
  ref
) {
  const Component = asChild ? Slot : 'button';
  return (
    <Component
      ref={ref}
      type={asChild ? undefined : (type ?? 'button')}
      className={buttonRecipe({ variant, size, className })}
      {...props}
    />
  );
});

Button.displayName = 'Button';
