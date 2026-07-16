/**
 * SegmentedControl primitive — a single-choice pill control.
 *
 * Base UI's RadioGroup supplies the radio-group semantics: roving tabindex and
 * arrow-key navigation that moves focus and selection together, wrapping at
 * both ends (ADR-0005 — Base UI owns the expensive generic behavior, we own
 * the look). Arrow keys are the whole navigation surface; the ARIA radiogroup
 * pattern has no Home/End. Use it when the user must choose one of a small
 * number of related options, such as a sex selector.
 *
 * Each segment renders as a native `<button>` so `disabled` is the real
 * attribute rather than an ARIA approximation.
 *
 * Generic over the value union, so a caller holding `Gender` gets `Gender`
 * back from `onValueChange` — no cast — and an option outside the union is a
 * compile error.
 *
 * Drive tests by `radiogroup` and the option labels; assert on `aria-checked`
 * to verify selection.
 */
import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';

import * as styles from './segmented-control.css';

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  /** Human-readable label for the group (required for accessibility). */
  'aria-label': string;
  /** Currently selected value. */
  value: T;
  /** Called when the user selects a different value. */
  onValueChange: (value: T) => void;
  /** Options to render as segments. */
  options: ReadonlyArray<SegmentedControlOption<T>>;
  /** Whether the whole control is disabled. */
  disabled?: boolean;
}

export function SegmentedControl<T extends string>({
  'aria-label': ariaLabel,
  value,
  onValueChange,
  options,
  disabled = false,
}: SegmentedControlProps<T>): JSX.Element {
  return (
    <RadioGroup
      className={styles.track}
      aria-label={ariaLabel}
      value={value}
      disabled={disabled}
      // Truncates the arity: Base UI passes an eventDetails second argument
      // that this primitive's `(value: T) => void` contract does not promise.
      onValueChange={(next) => onValueChange(next)}
    >
      {options.map((option) => (
        <Radio.Root
          key={option.value}
          value={option.value}
          nativeButton
          render={<button />}
          className={styles.item}
        >
          {option.label}
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}
