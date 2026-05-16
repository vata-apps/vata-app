import { type ReactNode } from 'react';

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
    <div className="bg-background text-foreground flex h-screen flex-col overflow-hidden">
      <header className="border-border flex h-14 shrink-0 items-center border-b px-3">
        <TreeNav />
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)_320px]">
        <div className="bg-muted border-border overflow-y-auto border-r" />
        <main className="overflow-y-auto">{children}</main>
        <div className="bg-muted border-border overflow-y-auto border-l" />
      </div>
    </div>
  );
}
