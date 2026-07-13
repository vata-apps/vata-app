/**
 * SegmentedControl primitive — a single-choice pill control.
 *
 * Encapsulates radio-group semantics, roving tabindex, and keyboard navigation
 * (arrow keys, Home/End). Use it when the user must choose one of a small
 * number of related options, such as a sex selector.
 *
 * Drive tests by `radiogroup` and the option labels; assert on `aria-checked`
 * to verify selection.
 */
import * as React from 'react';

import * as styles from './segmented-control.css';

export interface SegmentedControlOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  /** Human-readable label for the group (required for accessibility). */
  'aria-label': string;
  /** Currently selected value. */
  value: string;
  /** Called when the user selects a different value. */
  onValueChange: (value: string) => void;
  /** Options to render as segments. */
  options: SegmentedControlOption[];
  /** Whether the whole control is disabled. */
  disabled?: boolean;
}

export function SegmentedControl({
  'aria-label': ariaLabel,
  value,
  onValueChange,
  options,
  disabled = false,
}: SegmentedControlProps): JSX.Element {
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );

  function selectIndex(index: number): void {
    const next = options[index];
    if (!next) return;
    // The radiogroup pattern moves focus with the selection. Without this the
    // roving tabindex strands focus on the previously selected segment, so
    // arrow keys would keep stepping from it and never reach the far options.
    itemRefs.current[index]?.focus();
    if (next.value !== value) {
      onValueChange(next.value);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent, index: number): void {
    if (disabled) return;
    let nextIndex = index;
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = index > 0 ? index - 1 : options.length - 1;
        event.preventDefault();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = index < options.length - 1 ? index + 1 : 0;
        event.preventDefault();
        break;
      case 'Home':
        nextIndex = 0;
        event.preventDefault();
        break;
      case 'End':
        nextIndex = options.length - 1;
        event.preventDefault();
        break;
      default:
        return;
    }
    selectIndex(nextIndex);
  }

  return (
    <div className={styles.track} role="radiogroup" aria-label={ariaLabel}>
      {options.map((option, index) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={index === activeIndex ? 0 : -1}
            disabled={disabled}
            className={styles.item({ active: checked })}
            onClick={() => selectIndex(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
