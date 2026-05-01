import { Slot } from '@radix-ui/react-slot';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { Icon, type IconName } from './icon';

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
 *
 * Icon-only look: pair any size with `hideLabel` (and a `leadingIcon` or
 * `trailingIcon`) — the button collapses to a square of the matching size.
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
    },
    hideLabel: {
      true: 'px-0',
      false: '',
    },
  },
  compoundVariants: [
    { hideLabel: true, size: 'sm', class: 'w-7' },
    { hideLabel: true, size: 'md', class: 'w-9' },
    { hideLabel: true, size: 'lg', class: 'w-11' },
    /* `link` ignores size dimensions — it lays out inline like text. */
    {
      variant: 'link',
      size: ['sm', 'md', 'lg'],
      class: 'h-auto w-auto p-0',
    },
  ],
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    hideLabel: false,
  },
});

type ButtonRecipeProps = VariantProps<typeof buttonRecipe>;

/** Pixel size of the icon rendered inside a Button at each button size. */
const ICON_PIXEL_SIZE: Record<NonNullable<ButtonRecipeProps['size']>, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

/**
 * Props accepted by {@link Button}. Extends the native `<button>` props plus
 * recipe variants, leading/trailing icon slots, and the `asChild` polymorphism
 * flag.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonRecipeProps {
  /**
   * Visual intent of the button. See {@link buttonRecipe} for semantics.
   * Defaults to `"primary"`.
   */
  variant?: ButtonRecipeProps['variant'];

  /**
   * Size of the button. Defaults to `"md"`. For an icon-only look, combine any
   * size with `hideLabel` and at least one of `leadingIcon` / `trailingIcon`.
   */
  size?: ButtonRecipeProps['size'];

  /**
   * Icon rendered before the label. Pass a curated {@link IconName}.
   * The icon is automatically marked `aria-hidden` — the visible (or
   * `hideLabel`-hidden) `children` carry the accessible name.
   */
  leadingIcon?: IconName;

  /**
   * Icon rendered after the label. See {@link ButtonProps.leadingIcon}.
   */
  trailingIcon?: IconName;

  /**
   * Visually hides `children`, leaving only the icon(s). The label is still
   * rendered as `sr-only` text so screen readers announce the button. Always
   * pass meaningful `children` even when this is `true` — never an empty
   * string.
   *
   * @example
   * <Button leadingIcon="x" hideLabel variant="ghost">Close dialog</Button>
   */
  hideLabel?: boolean;

  /**
   * When `true`, the Button does not render its own `<button>`: it renders the
   * single child element instead, forwarding all props (including click handlers
   * and styling) to it. Use this to style links, router `<Link>` elements, or
   * any custom interactive element with the Button look — without nesting an
   * `<a>` inside a `<button>`, which is invalid HTML.
   *
   * Note: `asChild` is incompatible with `leadingIcon` / `trailingIcon`,
   * because Radix `Slot` requires a single child and we cannot inject siblings
   * around it without breaking the contract. Render the icons inside your
   * child element instead.
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
 * // Primary action with a leading icon
 * <Button leadingIcon="plus" onClick={handleAdd}>Add individual</Button>
 *
 * @example
 * // Trailing icon (e.g., a "next" affordance)
 * <Button trailingIcon="arrow-right" variant="secondary">Continue</Button>
 *
 * @example
 * // Icon-only — children stay for screen readers
 * <Button leadingIcon="x" hideLabel variant="ghost">Close dialog</Button>
 *
 * @example
 * // Polymorphic — render a router link with button styling
 * <Button asChild>
 *   <Link to="/trees/new">New tree</Link>
 * </Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant,
    size,
    leadingIcon,
    trailingIcon,
    hideLabel = false,
    asChild = false,
    className,
    type,
    children,
    ...props
  },
  ref
) {
  if (import.meta.env.DEV && asChild && (leadingIcon || trailingIcon)) {
    throw new Error(
      'Button: `leadingIcon` and `trailingIcon` are not supported when `asChild` is true. ' +
        'Render the icons inside your child element instead.'
    );
  }

  const Component = asChild ? Slot : 'button';
  const iconSize = ICON_PIXEL_SIZE[size ?? 'md'];
  const label = hideLabel ? <span className="sr-only">{children}</span> : children;

  return (
    <Component
      ref={ref}
      type={asChild ? undefined : (type ?? 'button')}
      className={buttonRecipe({ variant, size, hideLabel, className })}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {leadingIcon && <Icon name={leadingIcon} size={iconSize} />}
          {label}
          {trailingIcon && <Icon name={trailingIcon} size={iconSize} />}
        </>
      )}
    </Component>
  );
});

Button.displayName = 'Button';
