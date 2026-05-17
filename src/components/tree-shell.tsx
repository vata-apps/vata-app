import { type ReactNode } from 'react';
import { Box, Flex, Grid } from '@radix-ui/themes';

import { TreeNav } from './tree-nav';

/**
 * Props accepted by {@link TreeShell}.
 */
export interface TreeShellProps {
  /** The routed page, rendered in the centre column. */
  children: ReactNode;
}

/**
 * The in-tree application shell — the persistent frame around every page
 * under an open tree.
 *
 * It is a persistent header carrying the {@link TreeNav} icon navigation
 * bar, above a fixed three-column layout: a left panel, the page body,
 * and a right panel.
 *
 * The two side panels are intentionally empty in this iteration. They are
 * the reserved structural home for contextual content (entity lists,
 * contextual detail panels) added in later work. Column widths are fixed —
 * no resizing, collapsing, or responsive behaviour. Each column scrolls
 * independently, so long content in one never moves the others.
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
    <Flex direction="column" height="100vh" overflow="hidden">
      <Flex asChild align="center" flexShrink="0" px="3" height="56px">
        <header style={{ borderBottom: '1px solid var(--gray-a5)' }}>
          <TreeNav />
        </header>
      </Flex>
      <Grid columns="280px minmax(0, 1fr) 320px" flexGrow="1" minHeight="0">
        <Box
          overflow="auto"
          style={{ background: 'var(--gray-2)', borderRight: '1px solid var(--gray-a5)' }}
        />
        <Box asChild overflow="auto">
          <main>{children}</main>
        </Box>
        <Box
          overflow="auto"
          style={{ background: 'var(--gray-2)', borderLeft: '1px solid var(--gray-a5)' }}
        />
      </Grid>
    </Flex>
  );
}
