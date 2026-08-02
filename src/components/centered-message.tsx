import type { ReactNode } from 'react';

import { EmptyState } from '$components/ui/empty-state';
import * as styles from './centered-message.css';

/** A centered status message — loading, error, or empty state for a page or tab. */
export function CenteredMessage({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className={styles.wrap}>
      <EmptyState>{children}</EmptyState>
    </div>
  );
}
