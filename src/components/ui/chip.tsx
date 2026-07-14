/**
 * Chip primitive — a compact, dismissible token.
 *
 * Displays a label and an optional remove button. When `onRemove` is provided,
 * `removeAriaLabel` is required so the icon-only remove button is accessible.
 */
import { Icon } from '$components/icon';

import * as styles from './chip.css';

export type ChipProps =
  | { label: string; onRemove?: undefined; removeAriaLabel?: undefined }
  | { label: string; onRemove: () => void; removeAriaLabel: string };

export function Chip({ label, removeAriaLabel, onRemove }: ChipProps): JSX.Element {
  return (
    <span className={styles.chip}>
      {label}
      {onRemove && (
        <button
          type="button"
          className={styles.removeButton}
          onClick={onRemove}
          aria-label={removeAriaLabel}
        >
          <Icon name="x" size={12} />
        </button>
      )}
    </span>
  );
}
