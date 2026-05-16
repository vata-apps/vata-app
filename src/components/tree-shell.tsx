import { type ReactNode } from 'react';

/**
 * Props accepted by {@link TreeShell}.
 */
export interface TreeShellProps {
  /** The routed page, rendered in the centre column. */
  children: ReactNode;
}

/**
 * The in-tree application shell — a fixed three-column layout that frames
 * every page under an open tree: a left panel, the page body, and a right
 * panel.
 *
 * The two side panels are intentionally empty in this iteration. They are
 * the reserved structural home for contextual content (entity lists,
 * contextual detail panels) added in later work. Column widths are fixed —
 * no resizing, collapsing, or responsive behaviour. Each region scrolls
 * independently, so long content in one column never moves the others.
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
    <div className="bg-background text-foreground grid h-screen grid-cols-[280px_minmax(0,1fr)_320px] overflow-hidden">
      <div className="bg-muted border-border border-r" />
      <main className="overflow-y-auto">{children}</main>
      <div className="bg-muted border-border border-l" />
    </div>
  );
}
