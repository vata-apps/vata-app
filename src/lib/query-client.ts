import { MutationCache, QueryClient } from '@tanstack/react-query';

import i18n from '$/i18n/config';
import { notifyError } from './toast';

export const queryClient = new QueryClient({
  // Applies to every mutation without touching each of its call sites — the
  // 17 record-panel mutations (Notes/Names/Events/Relations) previously had
  // no `onError` at all, so a failed write was silently swallowed by
  // TanStack Query with no visible trace (see issue #247).
  mutationCache: new MutationCache({
    onError: (error) => {
      notifyError(i18n.t('common:errors.saveFailed'), error);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
