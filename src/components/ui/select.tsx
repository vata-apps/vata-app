import * as RadixSelect from '@radix-ui/react-select';
import { type ReactNode } from 'react';
import { tv } from 'tailwind-variants';

import { fieldRecipe, FieldWithHint, useFieldHint, type FieldRecipeProps } from './field';
import { Icon } from './icon';

/**
 * Trigger-only additions on top of the shared {@link fieldRecipe}.
 * The Select trigger needs a flex row (label + chevron) and the
 * placeholder colour token; everything else inherits from the field
 * tokens so a row mixing Inputs and Selects stays aligned.
 */
const selectTriggerExtras = tv({
  base: 'flex items-center justify-between gap-2 data-[placeholder]:text-muted-foreground',
});

/**
 * Shape of an option inside {@link SelectProps.options}.
 */
export interface SelectOption {
  /** Submitted value. */
  value: string;
  /** Localized label rendered in the trigger and the listbox. */
  label: ReactNode;
  /** Disables this option. */
  disabled?: boolean;
}

/**
 * Props accepted by {@link Select}.
 */
export interface SelectProps {
  /** Currently selected value. Controlled. */
  value: string | undefined;

  /** Called when the user selects an option. */
  onValueChange: (value: string) => void;

  /** Options to display. */
  options: SelectOption[];

  /**
   * Localized placeholder shown while no value is selected. Required so
   * the trigger has visible content even when empty.
   */
  placeholder: string;

  /** Visual size of the trigger. Defaults to `"md"`. */
  size?: FieldRecipeProps['size'];

  /**
   * Marks the field as invalid for both assistive tech (`aria-invalid`)
   * and visuals (red border + red focus ring).
   */
  invalid?: boolean;

  /** Disables the whole Select. */
  disabled?: boolean;

  /**
   * Optional help text rendered below the trigger. Wired via
   * `aria-describedby` so assistive tech announces it after the
   * accessible name. Pass localized content from the consumer.
   */
  hint?: ReactNode;

  /**
   * Localized accessible name for the trigger. Required when no
   * adjacent `<label htmlFor>` is associated with this Select. When a
   * label is associated externally, you can omit this and pass the
   * matching `id` instead.
   */
  'aria-label'?: string;

  /**
   * Optional additional `aria-describedby` ids. Merged with the
   * generated hint id rather than overwritten, so callers can stack
   * extra descriptions.
   */
  'aria-describedby'?: string;

  /** Optional id wired to the underlying trigger. */
  id?: string;
}

/**
 * Single-select dropdown built on `@radix-ui/react-select`.
 *
 * Renders a button trigger styled with the shared {@link fieldRecipe}
 * (so Input + Select rows stay aligned) and, when opened, a portalised
 * listbox with keyboard navigation, type-ahead, and focus management
 * — all delegated to Radix.
 *
 * The component is fully controlled. Pass an `aria-label` for the
 * trigger when no adjacent `<label htmlFor>` covers it.
 *
 * @example
 * <Select
 *   value={format}
 *   onValueChange={setFormat}
 *   options={[
 *     { value: 'gedcom-5.5.1', label: 'GEDCOM 5.5.1' },
 *     { value: 'gedcom-7.0', label: 'GEDCOM 7.0', disabled: true },
 *   ]}
 *   placeholder={t('export.format.placeholder')}
 *   aria-label={t('export.format.label')}
 *   hint={t('export.format.hint')}
 * />
 */
export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  size,
  invalid = false,
  disabled,
  hint,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  id,
}: SelectProps) {
  const { fieldId, hintId, describedBy } = useFieldHint({
    id,
    hint,
    ariaDescribedBy,
    prefix: 'select',
  });

  const triggerClass = `${fieldRecipe({ size, state: invalid ? 'error' : 'default' })} ${selectTriggerExtras()}`;

  const root = (
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RadixSelect.Trigger
        id={fieldId}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={triggerClass}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon asChild>
          <Icon name="chevron-down" size={16} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg"
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );

  return <FieldWithHint field={root} hint={hint} hintId={hintId} />;
}
