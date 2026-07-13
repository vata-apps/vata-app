/**
 * IconButton primitive — a square, icon-only button.
 *
 * Use for compact actions where a text label would be noisy (remove a row,
 * close a dialog, etc.). Always provide an accessible `aria-label` because
 * the button has no visible text.
 */
import * as React from 'react';

import * as styles from './icon-button.css';

type IconButtonElement = HTMLButtonElement;

export interface IconButtonProps extends React.ButtonHTMLAttributes<IconButtonElement> {}

export const IconButton = React.forwardRef<IconButtonElement, IconButtonProps>(
  ({ type = 'button', className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={`${styles.iconButton} ${className}`.trim()}
        {...props}
      />
    );
  }
);
IconButton.displayName = 'IconButton';
