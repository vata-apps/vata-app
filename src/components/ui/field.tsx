/**
 * Field primitive — label + hint/error scaffold wrapping a single form
 * control.
 *
 * Pass `htmlFor` matching the control's `id` for the label association;
 * `error` replaces `hint` when both are given.
 */
import * as React from 'react';

import * as styles from './field.css';

export interface FieldProps {
  /** Label text shown above the control. */
  label?: React.ReactNode;
  /** `id` of the control this labels. */
  htmlFor?: string;
  /** Append a required asterisk to the label. */
  required?: boolean;
  /** Helper text below the control. */
  hint?: React.ReactNode;
  /** Error message; replaces the hint and colors it like a status error. */
  error?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function Field({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  className = '',
  children,
}: FieldProps): JSX.Element {
  return (
    <div className={`${styles.field} ${className}`.trim()}>
      {label && (
        <label className={styles.label} htmlFor={htmlFor}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error && <span className={styles.error}>{error}</span>}
      {!error && hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}
