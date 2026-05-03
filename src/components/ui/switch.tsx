import * as RadixSwitch from '@radix-ui/react-switch';
import { useId, type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Recipe for the Switch's track and thumb dimensions.
 *
 * Sizes:
 * - `sm` — dense rows (toolbars, tweak panels).
 * - `md` — default — settings rows, modal toggles.
 * - `lg` — hero settings, accessibility-focused surfaces.
 */
export const switchTrackRecipe = tv({
  base: [
    'relative inline-flex shrink-0 items-center rounded-full',
    'bg-input data-[state=checked]:bg-primary',
    'transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  variants: {
    size: {
      sm: 'h-4 w-7',
      md: 'h-5 w-9',
      lg: 'h-6 w-11',
    },
  },
  defaultVariants: { size: 'md' },
});

const switchThumbRecipe = tv({
  base: [
    'pointer-events-none block rounded-full bg-card shadow-sm',
    'transition-transform duration-150',
  ],
  variants: {
    size: {
      sm: 'size-3 translate-x-0.5 data-[state=checked]:translate-x-3.5',
      md: 'size-4 translate-x-0.5 data-[state=checked]:translate-x-[18px]',
      lg: 'size-5 translate-x-0.5 data-[state=checked]:translate-x-[22px]',
    },
  },
  defaultVariants: { size: 'md' },
});

type SwitchRecipeProps = VariantProps<typeof switchTrackRecipe>;

/**
 * Props accepted by {@link Switch}.
 */
export interface SwitchProps {
  /** Whether the switch is on. Controlled value. */
  checked: boolean;

  /** Called when the user toggles the switch. */
  onCheckedChange: (checked: boolean) => void;

  /** Localized label rendered next to the track. */
  label: ReactNode;

  /**
   * Optional localized description rendered under the label. Linked to
   * the switch via `aria-describedby` for assistive tech.
   */
  description?: ReactNode;

  /** Visual size of the switch. Defaults to `"md"`. */
  size?: SwitchRecipeProps['size'];

  /** Disables the switch. */
  disabled?: boolean;

  /** Optional id for the underlying button. Auto-generated if omitted. */
  id?: string;

  /**
   * Optional additional `aria-describedby` ids. Merged with the
   * generated description id rather than overwritten, so callers can
   * stack extra descriptions.
   */
  'aria-describedby'?: string;
}

/**
 * Toggle switch built on `@radix-ui/react-switch`.
 *
 * Renders a clickable row with the switch on the right and a label
 * (and optional description) on the left. The whole row is a `<label>`
 * so clicking anywhere toggles the control. Keyboard activation is
 * handled by Radix (Space/Enter on the focused track).
 *
 * Always pass `label` — the wrapper enforces a visible accessible name.
 *
 * @example
 * <Switch
 *   checked={preserveDates}
 *   onCheckedChange={setPreserveDates}
 *   label={t('import.options.preserveDates.label')}
 *   description={t('import.options.preserveDates.description')}
 * />
 */
export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  size,
  disabled,
  id,
  'aria-describedby': ariaDescribedBy,
}: SwitchProps): JSX.Element {
  const reactId = useId();
  const switchId = id ?? `switch-${reactId}`;
  const labelId = `${switchId}-label`;
  const descriptionId = description ? `${switchId}-description` : undefined;
  const describedBy = [ariaDescribedBy, descriptionId].filter(Boolean).join(' ') || undefined;

  return (
    <label
      htmlFor={switchId}
      className="flex w-full cursor-pointer items-start gap-3 py-1.5 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
    >
      <div className="flex flex-1 flex-col gap-0.5">
        <span id={labelId} className="text-foreground text-sm font-medium leading-tight">
          {label}
        </span>
        {description && (
          <span id={descriptionId} className="text-muted-foreground text-xs">
            {description}
          </span>
        )}
      </div>
      <RadixSwitch.Root
        id={switchId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        className={switchTrackRecipe({ size })}
      >
        <RadixSwitch.Thumb className={switchThumbRecipe({ size })} />
      </RadixSwitch.Root>
    </label>
  );
}
