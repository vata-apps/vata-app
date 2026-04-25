import type { HTMLAttributes } from 'react';
import { cn } from '$lib/utils';

interface ShortcutProps extends HTMLAttributes<HTMLSpanElement> {
  keys: string[];
}

const ALNUM = /^[A-Za-z0-9]$/;

export function Shortcut({ keys, className, ...rest }: ShortcutProps) {
  return (
    <span className={cn('vata-kbd', className)} aria-hidden="true" {...rest}>
      {keys.map((k, i) => (
        <span key={i} className={ALNUM.test(k) ? undefined : 'vata-kbd-sym'}>
          {k}
        </span>
      ))}
    </span>
  );
}
