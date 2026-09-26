import * as stylex from '@stylexjs/stylex';
import * as React from 'react';
import { styles } from './button.styles';

type ButtonElement = HTMLButtonElement;

export const BUTTON_SIZES = ['md'] as const;
export const BUTTON_VARIANTS = ['primary'] as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<ButtonElement> {
  size?: (typeof BUTTON_SIZES)[number];
  variant?: (typeof BUTTON_VARIANTS)[number];
}

export const Button = React.forwardRef<ButtonElement, ButtonProps>(
  ({ size = 'md', variant = 'primary', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        {...props}
        {...stylex.props(styles[variant], styles[size], styles.base)}
      />
    );
  }
);
Button.displayName = 'Button';
