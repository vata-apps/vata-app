import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$db-tree/citations', () => ({
  getCitationsBySourceId: vi.fn(),
}));

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getCitationsBySourceId } from '$db-tree/citations';
import { useCitationsBySource } from './useCitations';
import React from 'react';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useCitationsBySource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns citations for a source', async () => {
    const mockCitations = [
      { id: '1', sourceId: 'S-0001', page: 'p. 42', quality: 'primary' },
    ];
    vi.mocked(getCitationsBySourceId).mockResolvedValue(mockCitations as any);

    const { result } = renderHook(() => useCitationsBySource('S-0001'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockCitations);
    expect(getCitationsBySourceId).toHaveBeenCalledWith('S-0001');
  });
});
