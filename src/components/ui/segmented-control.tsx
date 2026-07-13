import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

import * as s from './segmented-control.css';

interface ContextValue {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const SegmentedControlContext = createContext<ContextValue>({
  value: '',
  onValueChange: () => {},
});

interface RootProps {
  /** The currently selected value. */
  value: string;
  onValueChange: (value: string) => void;
  /** Accessible label for the radiogroup. */
  'aria-label': string;
  children: ReactNode;
  /** Disables all items when true. Individual items may also be disabled independently. */
  disabled?: boolean;
}

/** Container for a group of mutually exclusive option buttons (ARIA radiogroup). */
function Root({
  value,
  onValueChange,
  'aria-label': ariaLabel,
  children,
  disabled,
}: RootProps): JSX.Element {
  return (
    <SegmentedControlContext.Provider value={{ value, onValueChange, disabled }}>
      <div className={s.root} role="radiogroup" aria-label={ariaLabel}>
        {children}
      </div>
    </SegmentedControlContext.Provider>
  );
}

interface ItemProps {
  /** The value this option represents; compared to Root's `value` to determine active state. */
  value: string;
  children: ReactNode;
  disabled?: boolean;
}

/** A single option in the segmented control. Reads active state from the Root via context. */
function Item({ value: itemValue, children, disabled }: ItemProps): JSX.Element {
  const ctx = useContext(SegmentedControlContext);
  const isActive = ctx.value === itemValue;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      className={[s.item, isActive ? s.itemActive : ''].filter(Boolean).join(' ')}
      disabled={disabled ?? ctx.disabled}
      onClick={() => ctx.onValueChange(itemValue)}
    >
      {children}
    </button>
  );
}

/**
 * Radiogroup-style button cluster for mutually exclusive choices.
 * Manages `aria-checked` state via React context; callers supply `value` and
 * `onValueChange`. No Base UI dependency — the native radio semantics are
 * applied directly.
 *
 * ```tsx
 * <SegmentedControl.Root value={sex} onValueChange={setSex} aria-label="Sex">
 *   <SegmentedControl.Item value="F">Female</SegmentedControl.Item>
 *   <SegmentedControl.Item value="M">Male</SegmentedControl.Item>
 *   <SegmentedControl.Item value="U">Unknown</SegmentedControl.Item>
 * </SegmentedControl.Root>
 * ```
 */
export const SegmentedControl = { Root, Item };
