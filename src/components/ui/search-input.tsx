/**
 * SearchInput primitive — filter-as-you-type field for a list pane.
 *
 * Shows a clear affordance once there is text and `onClear` is given.
 */
import * as React from 'react';

import { Icon } from '$components/icon';
import * as styles from './search-input.css';

export interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Called when the clear button is activated. */
  onClear?: () => void;
  /** Accessible label for the clear button (required when `onClear` is given — pass a translated string). */
  clearLabel?: string;
  className?: string;
}

export function SearchInput({
  value = '',
  onChange,
  onClear,
  clearLabel,
  className = '',
  ...props
}: SearchInputProps): JSX.Element {
  return (
    <div className={`${styles.root} ${className}`.trim()}>
      <Icon name="search" size={13} />
      <input type="text" className={styles.input} value={value} onChange={onChange} {...props} />
      {value.length > 0 && onClear && (
        <button
          type="button"
          className={styles.clear}
          title={clearLabel}
          aria-label={clearLabel}
          onClick={onClear}
        >
          <Icon name="x" size={13} />
        </button>
      )}
    </div>
  );
}
