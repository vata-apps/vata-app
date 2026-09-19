/**
 * Button primitive — a styled `<button>` with four variants.
 *
 * Use `variant` to choose the visual weight:
 * - `primary`: primary actions like "Save".
 * - `secondary` (default): secondary actions like "Cancel".
 * - `danger`: destructive confirmations like "Discard" or "Delete".
 *
 * Use `size` to choose the size:
 * - `sm`: actions inside another components
 * - `md` (default): main actions in the page
 *
 * The component forwards refs and native button attributes; disabled and
 * focus states are handled by the stylesheet.
 */
import * as React from 'react';

import * as styles from './button.css';

type ButtonElement = HTMLButtonElement;

export const BUTTON_SIZES = ['sm', 'md'] as const;
export const BUTTON_VARIANTS = ['primary', 'secondary', 'danger'] as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<ButtonElement> {
  size?: (typeof BUTTON_SIZES)[number];
  variant?: (typeof BUTTON_VARIANTS)[number];
}

export const Button = React.forwardRef<ButtonElement, ButtonProps>(
  ({ size = 'md', variant = 'secondary', type = 'button', className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={`${styles.button({ size, variant })} ${className}`.trim()}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
