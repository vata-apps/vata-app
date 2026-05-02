import { describe, it, expect, vi } from 'vitest';

// Mock Tauri plugins so importing connection.ts doesn't pull in native bindings.
// These mocks are not exercised — they only need to satisfy the imports.
vi.mock('@tauri-apps/plugin-sql', () => ({
  default: {
    load: vi.fn(),
  },
}));

vi.mock('@tauri-apps/plugin-fs', () => ({
  mkdir: vi.fn(),
  rename: vi.fn(),
  exists: vi.fn(),
}));

vi.mock('@tauri-apps/api/path', () => ({
  appDataDir: vi.fn(),
}));

import { getTreeDb, closeTreeDb, isTreeDbOpen, getCurrentTreePath } from './connection';

// These tests lock the no-tree-open contract documented in
// docs/architecture/app-structure.md ("Invariants for AI Agents").
// They guard against regressions where outside routes might silently get a
// tree DB instead of an error, or where state leaks between contexts.
describe('connection — no tree open invariants', () => {
  it('reports no tree open in initial state', () => {
    expect(isTreeDbOpen()).toBe(false);
    expect(getCurrentTreePath()).toBeNull();
  });

  it('getTreeDb rejects when called outside an open tree context', async () => {
    await expect(getTreeDb()).rejects.toThrow('No tree database is currently open');
  });

  it('closeTreeDb is a no-op when no tree is open', async () => {
    await expect(closeTreeDb()).resolves.toBeUndefined();
    expect(isTreeDbOpen()).toBe(false);
    expect(getCurrentTreePath()).toBeNull();
  });
});
