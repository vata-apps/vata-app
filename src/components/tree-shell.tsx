import { type ReactNode } from 'react';
import { Box, Flex } from '@radix-ui/themes';

import { TreeNav } from './tree-nav';

/**
 * Props accepted by {@link TreeShell}.
 */
export interface TreeShellProps {
  /** The routed page, rendered full-width in the shell body. */
  children: ReactNode;
}

/**
 * The in-tree application shell — the persistent frame around every page
 * under an open tree.
 *
 * A narrow {@link TreeNav} rail (carrying the section links and the Settings
 * control) runs down the left edge, beside a single full-width body that
 * holds the routed page.
 *
 * The shell provides no fixed side panels: pages render full-width by
 * default and build any panels they need inside their own body. See
 * [ADR-006](../../docs/adr/0006-full-width-shell.md).
 *
 * Rendered once by the in-tree layout route, wrapping the routed `Outlet`.
 *
 * @example
 * <TreeShell>
 *   <Outlet />
 * </TreeShell>
 */
export function TreeShell({ children }: TreeShellProps): JSX.Element {
  return (
    <Flex direction="row" height="100vh" overflow="hidden">
      <TreeNav />
      {/* minWidth="0" lets the body shrink below its content's min-content
          width on the row's main axis, so wide content scrolls inside <main>
          instead of overflowing past the rail. */}
      <Box asChild flexGrow="1" minWidth="0" minHeight="0" overflow="auto">
        <main>{children}</main>
      </Box>
    </Flex>
  );
}
