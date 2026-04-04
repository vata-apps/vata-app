import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$db-tree/files', () => ({
  getFilesBySourceId: vi.fn(),
}));

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getFilesBySourceId } from '$db-tree/files';
import { useFilesBySource } from './useFiles';
import React from 'react';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useFilesBySource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns files for a source', async () => {
    const mockFiles = [
      { id: '1', originalFilename: 'scan.jpg', mimeType: 'image/jpeg' },
    ];
    vi.mocked(getFilesBySourceId).mockResolvedValue(mockFiles as any);

    const { result } = renderHook(() => useFilesBySource('S-0001'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockFiles);
    expect(getFilesBySourceId).toHaveBeenCalledWith('S-0001');
  });
});
