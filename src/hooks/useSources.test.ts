import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$db-tree/sources', () => ({
  getAllSources: vi.fn(),
  getSourceById: vi.fn(),
  searchSources: vi.fn(),
}));

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAllSources, getSourceById, searchSources } from '$db-tree/sources';
import { useSources, useSource, useSearchSources } from './useSources';
import React from 'react';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useSources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns sources from getAllSources', async () => {
    const mockSources = [{ id: 'S-0001', title: 'Census 1901', author: null, repositoryId: null }];
    vi.mocked(getAllSources).mockResolvedValue(mockSources as any);

    const { result } = renderHook(() => useSources(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockSources);
    expect(getAllSources).toHaveBeenCalledOnce();
  });
});

describe('useSource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a single source by ID', async () => {
    const mockSource = { id: 'S-0001', title: 'Census 1901' };
    vi.mocked(getSourceById).mockResolvedValue(mockSource as any);

    const { result } = renderHook(() => useSource('S-0001'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockSource);
    expect(getSourceById).toHaveBeenCalledWith('S-0001');
  });
});

describe('useSearchSources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('searches sources when query is non-empty', async () => {
    const mockResults = [{ id: 'S-0001', title: 'Census 1901' }];
    vi.mocked(searchSources).mockResolvedValue(mockResults as any);

    const { result } = renderHook(() => useSearchSources('Census'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockResults);
    expect(searchSources).toHaveBeenCalledWith('Census');
  });

  it('falls back to getAllSources when query is empty', async () => {
    const mockSources = [{ id: 'S-0001', title: 'Census 1901' }];
    vi.mocked(getAllSources).mockResolvedValue(mockSources as any);

    const { result } = renderHook(() => useSearchSources(''), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockSources);
    expect(getAllSources).toHaveBeenCalledOnce();
    expect(searchSources).not.toHaveBeenCalled();
  });
});
