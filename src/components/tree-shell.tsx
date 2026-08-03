import { type ReactNode } from 'react';

import { TreeHeader } from './tree-header';
import { TreeNav } from './tree-nav';
import * as styles from './tree-shell.css';

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
 * control) runs down the left edge. Beside it, a {@link TreeHeader} sits
 * above a single full-width body that holds the routed page.
 *
 * The shell provides no fixed side panels: pages render full-width by
 * default and build any panels they need inside their own body. See
 * [Layouts](../../docs/ui/layouts.md).
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
    <div className={styles.shell}>
      <TreeNav />
      <div className={styles.body}>
        <TreeHeader />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
