/**
 * Button primitive — a styled `<button>` with four variants.
 *
 * Use `variant` to choose the visual weight:
 * - `solid` (default): primary actions like "Save".
 * - `ghost`: secondary actions like "Cancel".
 * - `danger`: destructive confirmations like "Discard" or "Delete".
 * - `dashed`: the "add another row" affordance inside a form section.
 *
 * The component forwards refs and native button attributes; disabled and
 * focus states are handled by the stylesheet.
 */
import * as React from 'react';

import * as styles from './button.css';

type ButtonElement = HTMLButtonElement;

export interface ButtonProps extends React.ButtonHTMLAttributes<ButtonElement> {
  /** Visual weight of the button. */
  variant?: 'solid' | 'ghost' | 'danger' | 'dashed';
}

export const Button = React.forwardRef<ButtonElement, ButtonProps>(
  ({ variant = 'solid', type = 'button', className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={`${styles.button({ variant })} ${className}`.trim()}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
