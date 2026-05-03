import * as RadixPopover from '@radix-ui/react-popover';
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { tv } from 'tailwind-variants';

const contentRecipe = tv({
  base: [
    'bg-popover text-popover-foreground shadow-lg',
    'rounded-lg border border-border',
    'z-50 overflow-hidden',
    'focus:outline-none',
  ],
});

/**
 * Root provider — same API as `@radix-ui/react-popover`'s `Root`. Wraps
 * the trigger and the content in a controlled or uncontrolled open
 * state.
 */
export const Popover = RadixPopover.Root;

/**
 * Trigger — wrap your button to open/close the popover. Use `asChild`
 * so the underlying Button (or other element) receives the click +
 * keyboard handlers and refs.
 */
export const PopoverTrigger = RadixPopover.Trigger;

/**
 * Floating panel anchored to the trigger. Defaults: `side="top"`,
 * `align="end"`, `sideOffset=6`. Override per call when needed.
 *
 * The panel renders inside a portal, traps Tab navigation, closes on
 * Escape and on outside click. All ARIA wiring is handled by Radix.
 */
export const PopoverContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof RadixPopover.Content> & { children: ReactNode }
>(function PopoverContent({ className, children, sideOffset = 6, ...props }, ref) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        ref={ref}
        sideOffset={sideOffset}
        className={contentRecipe({ className })}
        {...props}
      >
        {children}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  );
});
PopoverContent.displayName = 'PopoverContent';
