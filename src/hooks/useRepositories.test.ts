import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$db-tree/repositories', () => ({
  getAllRepositories: vi.fn(),
  getRepositoryById: vi.fn(),
}));

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAllRepositories, getRepositoryById } from '$db-tree/repositories';
import { useRepositories, useRepository } from './useRepositories';
import React from 'react';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useRepositories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns repositories from getAllRepositories', async () => {
    const mockRepos = [{ id: 'R-0001', name: 'BAnQ' }];
    vi.mocked(getAllRepositories).mockResolvedValue(mockRepos as any);

    const { result } = renderHook(() => useRepositories(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockRepos);
    expect(getAllRepositories).toHaveBeenCalledOnce();
  });
});

describe('useRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a single repository by ID', async () => {
    const mockRepo = { id: 'R-0001', name: 'BAnQ' };
    vi.mocked(getRepositoryById).mockResolvedValue(mockRepo as any);

    const { result } = renderHook(() => useRepository('R-0001'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockRepo);
    expect(getRepositoryById).toHaveBeenCalledWith('R-0001');
  });
});
