import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getTreeById, openTreeDb } = vi.hoisted(() => ({
  getTreeById: vi.fn(),
  openTreeDb: vi.fn(),
}));

vi.mock('$/components/tree-shell/tree-shell', () => ({
  TreeShell: () => null,
}));

vi.mock('$/db/connection', () => ({
  closeTreeDb: vi.fn(),
  getCurrentTreePath: vi.fn(),
  isTreeDbOpen: vi.fn(),
  openTreeDb,
}));

vi.mock('$/db/system/trees', () => ({
  getTreeById,
}));

import { QueryClient } from '@tanstack/react-query';
import { Route } from './$treeId';

describe('tree route database setup', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    getTreeById.mockReset();
    openTreeDb.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('opens the tree database in beforeLoad before route loaders run', async () => {
    const order: string[] = [];
    const tree = { path: '/trees/family' };
    let resolveDatabaseOpen: (() => void) | undefined;
    getTreeById.mockImplementation(async () => {
      order.push('getTreeById');
      return tree;
    });
    openTreeDb.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          order.push('openTreeDb');
          resolveDatabaseOpen = resolve;
        })
    );

    const beforeLoad = Route.options.beforeLoad;
    if (!beforeLoad) throw new Error('Tree route must define beforeLoad');

    let beforeLoadCompleted = false;
    const beforeLoadPromise = beforeLoad({
      params: { treeId: '42' },
      context: { queryClient },
    } as Parameters<typeof beforeLoad>[0]).then(() => {
      beforeLoadCompleted = true;
    });

    await vi.waitFor(() => expect(openTreeDb).toHaveBeenCalled());

    expect(order).toEqual(['getTreeById', 'openTreeDb']);
    expect(openTreeDb).toHaveBeenCalledWith(tree.path);
    expect(beforeLoadCompleted).toBe(false);

    if (!resolveDatabaseOpen) throw new Error('Database open did not start');
    resolveDatabaseOpen();
    await beforeLoadPromise;
    expect(beforeLoadCompleted).toBe(true);
  });

  it('does not open a database when the tree does not exist', async () => {
    getTreeById.mockResolvedValue(null);

    const beforeLoad = Route.options.beforeLoad;
    if (!beforeLoad) throw new Error('Tree route must define beforeLoad');

    await beforeLoad({
      params: { treeId: '42' },
      context: { queryClient },
    } as Parameters<typeof beforeLoad>[0]);

    expect(openTreeDb).not.toHaveBeenCalled();
  });
});
