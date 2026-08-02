/**
 * Field primitive — label scaffold wrapping a single form control.
 *
 * Pass `htmlFor` matching the control's `id` for the label association.
 */
import * as React from 'react';

import * as styles from './field.css';

export interface FieldProps {
  /** Label text shown above the control. */
  label?: React.ReactNode;
  /** `id` of the control this labels. */
  htmlFor?: string;
  className?: string;
  children?: React.ReactNode;
}

export function Field({ label, htmlFor, className = '', children }: FieldProps): JSX.Element {
  return (
    <div className={`${styles.field} ${className}`.trim()}>
      {label && (
        <label className={styles.label} htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
    </div>
  );
}
