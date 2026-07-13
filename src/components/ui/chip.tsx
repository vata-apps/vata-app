/**
 * Chip primitive — a compact, dismissible token.
 *
 * Displays a label and an optional remove button. The remove button is
 * icon-only and must be labelled with `removeAriaLabel` so the action is
 * accessible.
 */
import { Icon } from '$components/icon';

import * as styles from './chip.css';

export interface ChipProps {
  /** The chip text. */
  label: string;
  /** Accessible label for the remove button. Required when `onRemove` is set. */
  removeAriaLabel?: string;
  /** Called when the remove button is activated. */
  onRemove?: () => void;
}

export function Chip({ label, removeAriaLabel, onRemove }: ChipProps): JSX.Element {
  return (
    <span className={styles.chip}>
      {label}
      {onRemove && (
        <button
          type="button"
          className={styles.removeButton}
          onClick={onRemove}
          aria-label={removeAriaLabel ?? `Remove ${label}`}
        >
          <Icon name="x" size={12} />
        </button>
      )}
    </span>
  );
}
