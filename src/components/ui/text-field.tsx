import type { ComponentPropsWithoutRef } from 'react';

import * as s from './text-field.css';

type InputProps = { multiline?: false } & ComponentPropsWithoutRef<'input'>;
type TextAreaProps = { multiline: true } & ComponentPropsWithoutRef<'textarea'>;

export function TextField({
  multiline,
  className,
  ...rest
}: InputProps | TextAreaProps): JSX.Element {
  if (multiline) {
    const cls = [s.textarea, className].filter(Boolean).join(' ');
    return <textarea className={cls} {...(rest as ComponentPropsWithoutRef<'textarea'>)} />;
  }
  const cls = [s.input, className].filter(Boolean).join(' ');
  return <input className={cls} {...(rest as ComponentPropsWithoutRef<'input'>)} />;
}
