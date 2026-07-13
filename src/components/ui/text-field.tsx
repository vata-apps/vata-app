/**
 * TextField primitive — a single-line input or multiline textarea styled from
 * the token contract.
 *
 * Set `multiline` to render a `<textarea>`; otherwise renders an `<input>`.
 * All native attributes are forwarded. Drive tests by role (`textbox`) and
 * label, never by class name.
 */
import * as React from 'react';

import * as styles from './text-field.css';

interface TextFieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  multiline?: false;
}

interface TextFieldTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  multiline: true;
}

export type TextFieldProps = TextFieldInputProps | TextFieldTextAreaProps;

export const TextField = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldProps>(
  ({ multiline = false, className = '', ...props }, ref) => {
    const classes = `${styles.textField({ multiline })} ${className}`.trim();
    if (multiline) {
      return (
        <textarea
          ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
          className={classes}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      );
    }
    return (
      <input
        ref={ref as React.ForwardedRef<HTMLInputElement>}
        className={classes}
        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
      />
    );
  }
);
TextField.displayName = 'TextField';
