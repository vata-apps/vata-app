/**
 * IconButton primitive — a square, icon-only button.
 *
 * Use for compact actions where a text label would be noisy (remove a row,
 * close a dialog, etc.), or at `size="lg"` with `active` for a
 * navigation-rail item. Always provide an accessible `aria-label` because
 * the button has no visible text.
 *
 * Pass `render` (a single element, e.g. a router `Link`) to apply the same
 * styling and props to that element instead of a native `<button>` — for a
 * rail item that must be a real navigation, not a click handler.
 */
import * as React from 'react';

import * as styles from './icon-button.css';

type IconButtonElement = HTMLButtonElement;

export interface IconButtonProps extends React.ButtonHTMLAttributes<IconButtonElement> {
  /** Square dimensions: `md` (32px, default) for row actions, `lg` (38px) for a nav rail. */
  size?: 'md' | 'lg';
  /** Filled brand treatment marking the current selection (e.g. the active nav section). */
  active?: boolean;
  /** Render as this element instead of `<button>`, merging the icon-button styling onto it. */
  render?: React.ReactElement<{ className?: string }>;
}

export const IconButton = React.forwardRef<IconButtonElement, IconButtonProps>(
  ({ type = 'button', size = 'md', active = false, className = '', render, ...props }, ref) => {
    const classes = `${styles.iconButton({ size, active })} ${className}`.trim();

    if (render) {
      return React.cloneElement(render, {
        ...props,
        className: `${classes} ${render.props.className ?? ''}`.trim(),
        ref,
      } as React.ComponentProps<'a'> & { ref: typeof ref });
    }

    return <button ref={ref} type={type} className={classes} {...props} />;
  }
);
IconButton.displayName = 'IconButton';
