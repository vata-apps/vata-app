import { useTranslation } from 'react-i18next';

import { Button } from '$components/ui/button';

import * as styles from './list-page.css';

interface LoadMoreButtonProps {
  /** Requests the next page (e.g. `useInfiniteQuery`'s `fetchNextPage`). */
  onLoadMore: () => void;
  /** Whether the next page is currently being fetched — disables the button and swaps its label. */
  isLoading: boolean;
}

/**
 * The "Load more" affordance shared by every paginated list screen (People,
 * Events, Families) — a single home for its label, loading state, and
 * layout so the three screens can't drift from each other. Rendered by the
 * caller only while a further page exists (`hasNextPage`).
 */
export function LoadMoreButton({ onLoadMore, isLoading }: LoadMoreButtonProps): JSX.Element {
  const { t } = useTranslation('common');
  return (
    <div className={styles.loadMoreRow}>
      <Button variant="ghost" onClick={onLoadMore} disabled={isLoading}>
        {isLoading ? t('table.loadingMore') : t('table.loadMore')}
      </Button>
    </div>
  );
}
