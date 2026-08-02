import type { ReactNode } from 'react';

import { EmptyState } from '$components/ui/empty-state';

/** A centered status message — loading, error, or empty state for a page or tab. */
export function CenteredMessage({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
      <EmptyState>{children}</EmptyState>
    </div>
  );
}
